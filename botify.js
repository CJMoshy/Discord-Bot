//TODO: add a way to see what question was asked
//TODO: fix the output


const fs = require('node:fs')
const path = require('node:path')
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js')  //discord module
const { token } = require('D:\\CJ\\JavaScript\\Discord Bot\\config.json') //our token

// Create a new Discord client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds]})

//collection object for our commands
client.commands = new Collection()

//loader for command files
const foldersPath = path.join(__dirname, 'commands') 
const commandFolders = fs.readdirSync(foldersPath)
for(const folder of commandFolders){
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    for (const file of commandFiles){
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)
        if('data' in command && 'execute' in command){
            client.commands.set(command.data.name, command)
        }else{
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
        }
    }
}


//event listener for slashcommands
client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if(!command){
        console.error(`No command entitled, ${interaction.commandName} found.`)
        return
    }

    try{
        await command.execute(interaction)
    } catch (error) {
        console.error(error)
        if(interaction.replied || interaction.deferred){
            await interaction.followUp({content: 'There was an error executing this command',ephemeral: true})
        }else{
            await interaction.reply({ content: 'There was an error executing this command', ephemeral: true})
        }
    }
    console.log(interaction)
})


client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`)
})

// Log in to Discord with your app's token
client.login(token);
