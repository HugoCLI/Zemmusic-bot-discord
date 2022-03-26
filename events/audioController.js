
const voice = require('@discordjs/voice');
const play = require('play-dl');
const {Client, Intents, MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');


class audioController {
    constructor(guildid, client) {
        this.id = guildid;
        this.client = client;
        this.player = voice.createAudioPlayer();

        this.status = 0;
        this.voiceAdapterCreator, this.voiceChannelId, this.interaction, this.channelPlayInfo, this.stream, this.startMusic, this.connection;
        this.queue = [];
    }


    async searchSuggest(obj, interaction) {
        if(!obj.search) return 'voice::searchEmpty';
        let yt_info = await play.search(obj.search, {limit : 1});

       if(yt_info.length > 0) return this.embed({type: 'searchSuggest', data: yt_info[0], target: interaction});

    }

    async addQueue(obj, interaction) {
        if(!obj.search) return 'voice::searchEmpty';
        let yt_info = await play.search(obj.search, {limit : 1});

        if(this.voiceChannelId && this.voiceChannelId !== interaction.member.voice.channel.id) return 'voice::channelDontMatch';
        if(Object.keys(yt_info).length === 0) return 'voice::searchNotFound';


        this.queue.push(yt_info[0]);
        if(!this.interaction) this.interaction = interaction;
        if(!this.channelPlayInfo) this.channelPlayInfo = interaction.channelId;
        this.voiceChannelId = interaction.member.voice.channel.id;
        this.voiceAdapterCreator = interaction.channel.guild.voiceAdapterCreator;


        if(this.queue.length === 1 && this.status === 0) return this.play();
        return this.embed({type: 'addQueue', data: yt_info[0], target: interaction});
    }

    async play()  {
        let music = (this.queue.shift());
        if(!music.url) return false;


        let stream = await play.stream(music.url);
        this.stream = stream.stream;
        this.resource = voice.createAudioResource(stream.stream, {inputType: stream.type, inlineVolume: true });
        this.connection = voice.joinVoiceChannel({channelId: this.voiceChannelId, guildId: this.id, adapterCreator: this.voiceAdapterCreator, });
        await this.player.play(this.resource);
        this.connection.subscribe(this.player);
        this.status = 1;
        this.embed({type: 'playing', data: music, target: this.interaction});

        if(!this.startMusic) await this.interaction.deleteReply();
        this.startMusic = true;
        this.player.on(voice.AudioPlayerStatus.Idle, async () => {
            this.status = 0;
            console.log(this.queue);
            if(this.queue.length > 0) return this.play();
            return this.stopPlaying();
        });
    }

    async stopPlaying(interaction = null) {
        console.log(this.status);
         if(interaction) this.embed({type: 'stopping', target: interaction});
         this.channelPlayInfo, this.queue; this.voiceChannelId;

         if(this.connection) this.connection.destroy();
    }

    async skipPlaying(interaction = false) {
        if(this.status === 1) return false;
        if(this.queue.length > 0) return this.play();
        return this.stopPlaying(false);
    }

    async volume(vol, interaction = false) {
        if(this.status!==1) return false;
        if(!vol || vol > 100 || vol < 1) return false;
        if(interaction) this.embed({type: 'volumeChange', data : {volume: vol}, target: interaction});
        this.resource.volume.setVolume((vol/ 100));
    }




    async embed(obj) {
        if(obj.target && obj.type) {
            if(obj.type === 'addQueue') {
                const data = obj.data;

/*                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('cancel ' + audios[guildid].task[reqTime].token)
                            .setLabel('Retirer de la file d\'attente')
                            .setStyle('SECONDARY'),
                    );*/
                await obj.target.editReply({
                    content: `\`#${this.queue.length}\` Ajouté à la file d'attente : **${data.title}** (${data.durationRaw})`,
                    /*components: [row]*/
                });
            }


            if(obj.type === "volumeChange") {
                await obj.target.editReply({
                    content: `Volume modifié à ${obj.data.volume} % !`,
                });
            }
            if(obj.type === "searchSuggest") {
                const data = obj.data;
                const Embed = new MessageEmbed().setTitle('Tu peux aussi utiliser Zemmusic')
                    .setColor('#dd4343')
                    .setDescription('Son de qualité et beaucoup plus rapide ! Utilise la commande `/play <url ou recherche>` pour lancer la musique')
                    .addFields(
                        {name: 'Chanson', value: data.title},
                    );
                await obj.target.reply({embeds: [Embed]});
            }
            if(obj.type === 'playing') {
                const data = obj.data;
                const Embed = new MessageEmbed().setTitle(data.title).setURL(data.url)
                    .setColor('#dd4343').setAuthor('Lecture en cours')
                    .setImage(data.thumbnails[0].url)
                    .addFields(
                        {name: 'Auteur', value: data.channel.name, inline: true},
                        {name: 'Durée', value: data.durationRaw, inline: true }
                    );
                await this.client.channels.cache.get(this.channelPlayInfo).send({embeds: [Embed]});
            }
            if(obj.type === 'stopping') {
                await obj.target.reply("Au revoir !");
            }
        }
    }


}
module.exports = audioController;
