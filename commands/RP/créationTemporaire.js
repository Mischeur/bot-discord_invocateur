const { ButtonBuilder, SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
		.setName('temp')
		.setDescription('just for dev'),
	async execute(interaction) {
        const creation_perso_button = new ButtonBuilder({
            custom_id: "creation_perso_button",
            style: ButtonStyle.Primary,
            label: "Je souhaite créer un personnage",
            emoji: {
                name: "🔨"
            },
            disabled: false,
        })

		const embed_board = new EmbedBuilder({
            description: "Salutations !\n\nAlors, je sais, vous devez être extrêmement perdu dans (pas) tant de salons ! Peut-être qu'après tout ce discours, vous voudriez vous créer un personnage et commencer votre aventure !\n\nDans ce cas, je vous en pris ! Prenez votre temps et lancez votre périple !",
            footer: {
                text: "1 personnage par compte | 1 voyage sans retour",
            },
            image: {
                url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS79LpvZrs_1m66DSySpAM84E9kHk8K0sVIdL78OgpNKfiVohPRMXnNN1Jm2Tz43Yat1x4&usqp=CAU"
            },
            title: "Création d'un personnage"
        })
            .setColor('Orange')

        const creation_perso_row = new ActionRowBuilder({
            components: [creation_perso_button]
        })

        const channel = interaction.guild.channels.cache.get('1122131799259230289')
        
        channel.send({
            content: "",
            embeds: [embed_board],
            components : [creation_perso_row]
        })
    }
}