‎const fs = require('fs');
‎const path = require('path');
‎const axios = require('axios');
‎
‎const configPath = path.join(__dirname, '..', '..', 'config.json');
‎
‎function loadConfig() {
‎  try {
‎    const configData = fs.readFileSync(configPath, 'utf-8');
‎    const config = JSON.parse(configData);
‎    if (!config.admin) {
‎      config.admin = [];
‎    }
‎    return config;
‎  } catch (error) {
‎    console.error("Error loading config.json:", error);
‎    return { admin: [] };
‎  }
‎}
‎
‎module.exports = {
‎  nix: {
‎    name: 'cmd',
‎    author: 'ArYAN',
‎    version: '0.0.1',
‎    description: 'Manage commands: install, loadall, load, unload',
‎    usage: 'cmd <install|loadall|load|unload> [args]',
‎    admin: true,
‎    vip: true,
‎    category: 'Admin',
‎    prefix: false,
‎    aliases: ['cm']
‎  },
‎
‎  async onStart({ message, args, userId }) {
‎    const config = loadConfig();
‎
‎    if (!config.admin.includes(String(userId))) {
‎      return message.reply("❌ | Only bot's admin can use the command");
‎    }
‎    
‎    try {
‎      const subcmd = args[0]?.toLowerCase();
‎      const cmdFolder = path.join(__dirname, './');
‎      
‎      if (!global.teamnix || !global.teamnix.cmds) {
‎          global.teamnix = { cmds: new Map() };
‎      }
‎      const commands = global.teamnix.cmds;
‎
‎      if (!subcmd) {
‎        return message.reply('● Usage: `cmd <install|loadall|load|unload> [args]`');
‎      }
‎
‎      function clearRequireCache(filePath) {
‎        try {
‎          const resolvedPath = require.resolve(filePath);
‎          if (require.cache[resolvedPath]) {
‎            delete require.cache[resolvedPath];
‎          }
‎        } catch (err) {
‎          console.error('Failed to clear require cache:', err);
‎        }
‎      }
‎
‎      function registerCommand(cmd, commandsCollection) {
‎        if (!cmd || !cmd.nix || typeof cmd.nix.name !== 'string' || typeof cmd.onStart !== 'function') {
‎          return false;
‎        }
‎        const nameLower = cmd.nix.name.toLowerCase();
‎        commandsCollection.set(nameLower, cmd);
‎        if (Array.isArray(cmd.nix.aliases)) {
‎          for (const alias of cmd.nix.aliases) {
‎            const aliasLower = alias.toLowerCase();
‎            if (!commandsCollection.has(aliasLower)) {
‎              commandsCollection.set(aliasLower, cmd);
‎            }
‎          }
‎        }
‎        return true;
‎      }
‎
‎      if (subcmd === 'install') {
‎        const fileName = args[1];
‎        const url = args[2];
‎        
‎        if (!fileName || !url || !fileName.endsWith('.js')) {
‎          return message.reply('● Usage: `cmd install <filename.js> <URL>`\nExample: `cmd install link.js http://goatbin.vercel.app/raw/BCb5F-IC6`');
‎        }
‎
‎        let code;
‎        try {
‎          const response = await axios.get(url);
‎          code = response.data;
‎        } catch (err) {
‎          return message.reply(`❌ Failed to fetch code from URL.\nReason: ${err.message}`);
‎        }
‎
‎        const filePath = path.join(cmdFolder, fileName);
‎        if (fs.existsSync(filePath)) {
‎          return message.reply(`❌ Command file '${fileName}' already exists. Use 'cmd reload' or 'cmd unload' first.`);
‎        }
‎        
‎        try {
‎          fs.writeFileSync(filePath, code, 'utf-8');
‎        } catch (err) {
‎          console.error('Write File Error:', err);
‎          return message.reply(`❌ Failed to write command file.\nReason: ${err.message}`);
‎        }
‎        
‎        try {
‎          clearRequireCache(filePath);
‎          const loadedCmd = require(filePath);
‎          if (!registerCommand(loadedCmd, commands)) {
‎            fs.unlinkSync(filePath);
‎            return message.reply('❌ Invalid command format. Installation aborted.');
‎          }
‎          return message.reply(`✅ | Installed command "${loadedCmd.nix.name}" successfully from URL.\nCommand file is saved at /scripts/cmds/${fileName}`);
‎        } catch (err) {
‎          console.error('Install Load Error:', err);
‎          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
‎          return message.reply(`❌ Failed to load command.\nReason: ${err.message}`);
‎        }
‎      }
‎
‎      else if (subcmd === 'loadall') {
‎        if (!commands) return message.reply('❌ Commands collection unavailable.');
‎        commands.clear();
‎        
‎        const jsFiles = fs.readdirSync(cmdFolder).filter(f => f.endsWith('.js'));
‎        const txtFiles = fs.readdirSync(cmdFolder).filter(f => f.endsWith('.txt'));
‎        let loaded = 0;
‎        let failed = 0;
‎        let failedMessages = '';
‎
‎        for (const file of jsFiles) {
‎          try {
‎            const filePath = path.join(cmdFolder, file);
‎            clearRequireCache(filePath);
‎            const cmd = require(filePath);
‎            if (registerCommand(cmd, commands)) {
‎              loaded++;
‎            } else {
‎              failed++;
‎              failedMessages += ` ❗ ${file.replace('.js', '')} => Invalid command format\n`;
‎            }
‎          } catch (err) {
‎            failed++;
‎            console.error(`LoadAll Error (.js ${file}):`, err);
‎            failedMessages += ` ❗ ${file.replace('.js', '')} => ${err.name}: ${err.message}\n`;
‎          }
‎        }
‎
‎        for (const file of txtFiles) {
‎          const txtPath = path.join(cmdFolder, file);
‎          const jsName = file.replace(/\.txt$/, '.js');
‎          const jsPath = path.join(cmdFolder, jsName);
‎          try {
‎            fs.renameSync(txtPath, jsPath);
‎            clearRequireCache(jsPath);
‎            const cmd = require(jsPath);
‎            if (registerCommand(cmd, commands)) {
‎              loaded++;
‎            } else {
‎              failed++;
‎              failedMessages += ` ❗ ${jsName.replace('.js', '')} => Invalid command format in renamed file\n`;
‎            }
‎          } catch (err) {
‎            failed++;
‎            console.error(`LoadAll Error (.txt ${file}):`, err);
‎            failedMessages += ` ❗ ${file.replace('.txt', '')} => ${err.name}: ${err.message}\n`;
‎          }
‎        }
‎        
‎        let replyMessage = `✅ | Loaded successfully (${loaded}) command`;
‎        if (failed > 0) {
‎          replyMessage += `\n❌ | Failed to load (${failed}) command\n${failedMessages}👀 | Open console to see error details`;
‎        }
‎        return message.reply(replyMessage);
‎      }
‎
‎      else if (subcmd === 'unload') {
‎        const cmdName = args[1]?.toLowerCase();
‎        if (!cmdName) return message.reply('❌ Specify a command name to unload.');
‎        const targetCmd = commands.get(cmdName);
‎        if (!targetCmd) return message.reply(`❌ Command '${cmdName}' not found.`);
‎        const originalName = targetCmd.nix.name.toLowerCase();
‎        const jsFilePath = path.join(cmdFolder, `${originalName}.js`);
‎        const txtFilePath = path.join(cmdFolder, `${originalName}.txt`);
‎        if (!fs.existsSync(jsFilePath)) {
‎          return message.reply(`❌ Command file '${originalName}.js' not found. Already unloaded?`);
‎        }
‎        try {
‎          const aliases = [originalName, ...targetCmd.nix.aliases.map(a => a.toLowerCase())];
‎          for (const alias of aliases) {
‎            commands.delete(alias);
‎          }
‎          clearRequireCache(jsFilePath);
‎          fs.renameSync(jsFilePath, txtFilePath);
‎          return message.reply(`✅ | Unloaded command "${originalName}" successfully`);
‎        } catch (err) {
‎          console.error('Unload Command Error:', err);
‎          return message.reply(`❌ Failed to unload '${originalName}'.\nReason: ${err.message}`);
‎        }
‎      }
‎
‎      else if (subcmd === 'load') {
‎        const cmdName = args[1]?.toLowerCase();
‎        if (!cmdName) return message.reply('❌ Specify a command name to load.');
‎        let jsPath = path.join(cmdFolder, `${cmdName}.js`);
‎        const txtPath = path.join(cmdFolder, `${cmdName}.txt`);
‎        if (!fs.existsSync(jsPath)) {
‎          if (fs.existsSync(txtPath)) {
‎            try {
‎              fs.renameSync(txtPath, jsPath);
‎            } catch (err) {
‎              return message.reply(`❌ Failed to rename .txt to .js\nReason: ${err.message}`);
‎            }
‎          } else {
‎            return message.reply('❌ Command file not found.');
‎          }
‎        }
‎        try {
‎          clearRequireCache(jsPath);
‎          const cmd = require(jsPath);
‎          if (!registerCommand(cmd, commands)) throw new Error('Invalid command format');
‎          return message.reply(`✅ | Loaded command "${cmdName}" successfully`);
‎        } catch (err) {
‎          console.error('Load Command Error:', err);
‎          return message.reply(`❌ Failed to load command '${cmdName}'.\nReason: ${err.message}`);
‎        }
‎      }
‎      
‎      else if (subcmd === 'reload') {
‎        const cmdName = args[1]?.toLowerCase();
‎        if (!cmdName) return message.reply('❌ Specify a command to reload.');
‎        const targetCmd = commands.get(cmdName);
‎        if (!targetCmd) return message.reply(`❌ Command '${cmdName}' not found.`);
‎        const originalName = targetCmd.nix.name.toLowerCase();
‎        const filePath = path.join(cmdFolder, `${originalName}.js`);
‎        if (!fs.existsSync(filePath)) {
‎          return message.reply(`❌ Command file '${originalName}.js' not found.`);
‎        }
‎        try {
‎          const aliases = [originalName, ...targetCmd.nix.aliases.map(a => a.toLowerCase())];
‎          for (const alias of aliases) {
‎            commands.delete(alias);
‎          }
‎          clearRequireCache(filePath);
‎          const cmd = require(filePath);
‎          if (!registerCommand(cmd, commands)) throw new Error('Invalid command format after reload');
‎          return message.reply(`🔄 | Reloaded command "${originalName}" successfully`);
‎        } catch (err) {
‎          console.error('Reload Command Error:', err);
‎          return message.reply(`❌ Failed to reload command '${originalName}'.\nReason: ${err.message}`);
‎        }
‎      }
‎
‎      else {
‎        return message.reply('❌ Unknown subcommand. Use install, loadall, unload, load, or reload.');
‎      }
‎    } catch (err) {
‎      console.error('CMD Handler Error:', err);
‎      message.reply(`❌ An unexpected error occurred.\nReason: ${err.message}`);
‎    }
‎  }
‎};
‎
