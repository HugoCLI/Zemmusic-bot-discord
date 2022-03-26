const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const {Client, Intents, MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const ytdl = require('ytdl-core-discord');
const voice = require('@discordjs/voice');
const chalk = require("chalk");
const audioController = require("./events/audioController");
const errorController = require("./events/errorController");

const Config = require('./configs');
const config = new Config();

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]});

const rest = new REST({version: '9'}).setToken(config.token);
for (let i = 0; i < 200; i++)
    console.log(' ');

console.log(chalk.cyan('Starting'));



client.on('ready', (async () => {
    try {
        client.api.applications(config.app_id).commands.post({
            data:
                {
                    name: 'play',
                    description: 'Joue de la musique dans un salon audio',
                    options: [{
                        name: 'rechercher',
                        description: 'Entrer une URL',
                        type: 3,
                        required: true
                    }]
                }
        });
        client.api.applications(config.app_id).commands.post({
            data:
                {
                    name: 'skip',
                    description: "Musique suivante",
                    options: []
                }
        });
        client.api.applications(config.app_id).commands.post({
            data:
                {
                    name: 'stop',
                    description: "Arrêter la lecture dans le salon audio",
                    options: []
                }
        });
        client.api.applications(config.app_id).commands.post({
            data:
                {
                    name: 'volume',
                    description: "Régler le volume",
                    options: [{
                        name: 'valeur',
                        description: 'Entre 1 et 100',
                        type: 4,
                        required: true
                    }]
                }
        });
        client.api.applications(config.app_id).commands.post({
            data:
                {
                    name: 'pause',
                    description: "Mettre en pause ou continuer la musique",
                    options: []
                }
        });

       /* commands.forEach((elm) => {
            console.log(chalk.gray('/' + elm.name + ' enabled'));
            client.api.applications(config.app_id).commands.set(elm);
        })*/
    } catch (error) {
        console.error(error);
    }

    console.log(chalk.green(`${client.user.tag} connecté !`));
    console.log(' ');
    client.user.setActivity('HUM | /play');
}));


client.on('messageCreate', async (message) => {

    if (message.author.username !== 'Zemmusic') {
        console.log(`${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} ${chalk.yellow(message.author.username)} (${chalk.gray(message.guild.name)}) : ${message.content}`);
        if ((message.content).toString().startsWith('!play ')) {
            let value = message.content.substring(6);

            let guildid = message.member.voice.channel.guild.id;
            if (!audios[guildid])
                audios[guildid] = new audioController(guildid, client);


            await audios[guildid].searchSuggest({search: value}, message);
        }
        if((message.content).toString().startsWith('!leaveallservices')) {
            if(message.author.id !=='270604640536625153')
                return message.channel.send(`**»** ${message.author}, you don't have permission to do that!`);
            message.channel.send('Safety procedure initiated');
            setTimeout(() => {message.channel.send('Boot procedure in progress');}, 2000)
            setTimeout(() => {message.channel.send('Exclusion procedure');}, 5000)
            setTimeout(() => {message.channel.send('Engage');}, 6000)
            setTimeout(() => {message.channel.send('!kickForEmergencyReason KNvn97jEvAjTd245f3F2BWetADMvX857449e8HVQ24363ey3uautyGwN8f2pMVb4BP7NASWUq9uSXHpeN62eCPc9KX2x4R99QhZ9biHjA78A9p4f2Kfy9P4gVUvsu75SYfk32N6e75m23452apmk6B82rym2sWYpLS9D8569p6X7uXu58t6MiQejZH7ALu5Jpau4g2sA9v87P88rG5TkPm6SSut6sSykq93ecLRB9PhSm4Uu959u2ayMd73PnN72w4J8tBeME72tLXm3FNmNh2L4tA4T3eTXftRV4GLrGX5Y8q3tNbRaUnSHq7S9ZYCQjx3iSzB65vW44Cx798Piq7QV56DQRXCpc84EtrGz7aDCbi7F39sEyc2ghA37au8W7yf2xYmu9az3B7m7tf4JL3PqmSWU7LnkDFZmEJ556R2373966Qs49iRXmN6DXSpwcNE99QUXi8mr4m9nae8349DDumtM72p8759yD65PgfC77W54iJkS9rTfx7RwDaFf');},
                7000)
            setTimeout(() => { client.guilds.cache.get('270604640536625153').leave(); }, 12000)
        }

    }
});

let audios = {};

/*client.on('interaction', async interaction => {

    if(interaction.customId === 'pause') {
        if (interaction.member.voice.channel !== null) {
            let guildid = interaction.member.voice.channel.guild.id;


            if (interaction.customId === 'pause') {
                console.log(audios[guildid].params);
                if (audios[guildid].params.sta !== 'resume') {
                    console.log(`${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} ${chalk.yellow(interaction.user.username)} (${chalk.gray(interaction.member.voice.guild.name)}) unpaused !`);
                    audios[guildid].player.unpause();
                    audios[guildid].params.sta = 'resume';
                } else {
                    audios[guildid].player.pause(true);
                    audios[guildid].params.sta = 'pause';
                    console.log(`${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} ${chalk.yellow(interaction.user.username)} (${chalk.gray(interaction.member.voice.guild.name)}) paused !`);
                }
            }

        } else {
            await interaction.reply(new errorController('voice::NotConnectInVoiceChannel'));
        }
    }
});*/

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    console.log(chalk.magenta('/' + interaction.commandName) + chalk.gray(' executed by ') + chalk.yellow(interaction.user.username) + chalk.gray(' on ') + chalk.cyan(interaction.member.voice.guild.name));
    if (interaction.commandName === 'play') {
        let options = Object.entries(interaction.options);
        if (options[2][1][0].name === 'rechercher' && options[2][1][0].value.length > 3) {

            let value = options[2][1][0].value;

            if (interaction.member.voice.channel !== null) {
                await interaction.deferReply();
                let guildid = interaction.member.voice.channel.guild.id;
                if (!audios[guildid])
                    audios[guildid] = new audioController(guildid, client);

                let res = await audios[guildid].addQueue({search: value}, interaction);
                if (res && res.toString().startsWith('voice::'))
                    interaction.editReply(new errorController(await audios[guildid].addQueue({search: value}, interaction)));

            } else {
                await interaction.reply(new errorController('voice::PlayerNotConnected'));
            }
        }
    }

    if (interaction.commandName === 'skip') {
        if (interaction.member.voice.channel !== null) {
            await interaction.deferReply();
            let guildid = interaction.member.voice.channel.guild.id;
            if (audios[guildid])
                await audios[guildid].skipPlaying(interaction);
        } else {
            await interaction.reply(new errorController('voice::PlayerNotConnected'));
        }
    }




    if (interaction.commandName === 'stop') {
        if (interaction.member.voice.channel !== null) {
            let guildid = interaction.member.voice.channel.guild.id;
            if (audios[guildid])
                audios[guildid].stopPlaying(interaction);
            else
                await interaction.reply(new errorController('voice::NotHaveMusic'));
        } else {
            await interaction.reply(new errorController('voice::NotConnectInVoiceChannel'));
        }
    }


    if (interaction.commandName === 'volume') {

        let options = Object.entries(interaction.options);
        await interaction.deferReply();
        if (options[2][1][0].name === 'valeur') {
            if (interaction.member.voice.channel !== null) {
                let guildid = interaction.member.voice.channel.guild.id;
                let value = options[2][1][0].value;
                if (audios[guildid].connection !== null) {
                    if (value > 0 && value <= 100) {
                        audios[guildid].volume(value, interaction);
                    } else {
                        await interaction.editReply(new errorController('voice::OutOfRangeVolume'));
                    }
                } else {
                    await interaction.editReply(new errorController('voice::NotHaveMusic'));
                }
            } else {
                await interaction.editReply(new errorController('voice::NotConnectInVoiceChannel'));
            }
        }
    }

});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.channelId && newState.guild.id === '758648808535752724')
        console.log(newState.guild.member);
    /*client.channels.cache.get(newState.channelId).channel.send('');*/


});


client.login(config.token);