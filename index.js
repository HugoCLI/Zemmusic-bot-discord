const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const {Client, Intents, MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const ytdl = require('ytdl-core-discord');
const voice = require('@discordjs/voice');
const chalk = require("chalk");
const audioController = require("./events/audioController");
const errorController = require("./events/errorController");
const errorMessage = new errorController();

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


let audios = {};
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
                    interaction.editReply(errorMessage.get(res));

            } else {
                await interaction.editReply(errorMessage.get('voice::NotConnectInVoiceChannel'));
            }
        }
    }

    if (interaction.commandName === 'skip') {
        if (!interaction.member.voice.channel) return await interaction.reply(errorMessage.get('voice::NotConnectInVoiceChannel'));
        await interaction.deferReply();

        let guildid = interaction.member.voice.channel.guild.id;
        if (!audios[guildid]) return await interaction.reply(errorMessage.get('voice::NotHaveMusic'));
        await audios[guildid].skipPlaying(interaction);
    }


    if (interaction.commandName === 'stop') {
        if (!interaction.member.voice.channel) return await interaction.reply(errorMessage.get('voice::NotConnectInVoiceChannel'));
        let guildid = interaction.member.voice.channel.guild.id;
        if (!audios[guildid]) return await interaction.reply(errorMessage.get('voice::NotHaveMusic'));
        audios[guildid].stopPlaying(interaction);

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
                        await interaction.editReply(errorMessage.get('voice::OutOfRangeVolume'));
                    }
                } else {
                    await interaction.editReply(errorMessage.get('voice::NotHaveMusic'));
                }
            } else {
                await interaction.editReply(errorMessage.get('voice::NotConnectInVoiceChannel'));
            }
        }
    }

});

/*client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.channelId && newState.guild.id === '758648808535752724')
        console.log(newState.guild.member);
    /!*client.channels.cache.get(newState.channelId).channel.send('');*!/


});*/
client.login(config.token);