

const error = {
    'voice::channelDontMatch': "Tu n'est pas dans le bon channel audio !",
    'voice::searchEmpty': "Champs de recherche vide !",
    'voice::PlayerNotConnected': "Tu n'est pas connecté en salon audio. Ambiance toi en me rejoignant",
    'voice::NotHaveMusic': "Pas de lecture en cours",
    'voice::NotConnectInVoiceChannel': "Oh bah tien, comme par hasard, un andouille qui n'est pas connectée à un vocal.",
    'voice::QueueIsEmpty': "La file d'attente est vide !",
    'voice::OutOfRangeVolume': "C'est le mot de richelieu... HUM Bouffon  ! (Entre 1 et 100)",
    'voice::searchNotFound': "Nous n'avons rien trouvé à ce sujet",
    'voice::permMissingJoinSpeak': "Je n'est pas la permission de rejoindre/parler dans le salon audio."
}
class errorController {
    get(errorId) {
        let message;
        for (const [key, value] of Object.entries(error))
            if(key === errorId) return value;

        return 'Une erreur est survenue.';
    }
}
module.exports = errorController;
