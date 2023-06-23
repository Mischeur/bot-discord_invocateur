/** INTENTS : MessageContent,  */

const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ButtonComponent, ActionRowBuilder, MessageCollector } = require('discord.js');
const fiche_rp = require('../../database/fiche-rp.json')
function saveFicheBDD() {
    writeFile('./database/fiche-rp.json', JSON.stringify(fiche_rp), (err) => { })
}
const { writeFile } = require('fs');
const path = require('node:path');
const { stringify } = require('querystring');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Commencez donc votre aventure maintenant !'),
    async execute(interaction) {

        function ErrorTemps() {
            interaction.editReply({
                content: "Ah ! Vos cinq minutes sont passés ! Revenez me voir lorsque vous serez sûr !",
                embeds: [],
                components: []
            }).then(() => {
                setTimeout(() => {
                    interaction.deleteReply()
                }, 10000)
            })
        }

        const embed_confirmation = new EmbedBuilder()
            .setColor('Orange')
            .setTitle("Création d'un personnage")
            .setDescription("Voulez-vous créer un personnage ?")
            .setFooter({
                text: "Attention ! Tous les personnages créés ne peuvent être supprimés.",
                iconURL: "https://cdn.pixabay.com/photo/2012/04/23/15/39/traffic-sign-38589_1280.png"
            })

        const button_confirmation_oui = new ButtonBuilder({
            label: 'Je confirme',
            custom_id: 'confirmationOui',
            style: ButtonStyle.Success,
            emoji: {
                name: '✅'
            }
        })

        const button_confirmation_non = new ButtonBuilder({
            label: 'Euhhhh… Je verrais plus tard',
            custom_id: 'confirmationNon',
            style: ButtonStyle.Danger,
            emoji: {
                name: '✖️'
            }
        })

        const raw_confirmation = new ActionRowBuilder({
            components: [button_confirmation_oui, button_confirmation_non],
        })

        const response = await interaction.reply({
            embeds: [embed_confirmation],
            components: [raw_confirmation]
        })

        const collector_filter_confirmation = i => i.user.id === interaction.user.id

        try {
            const interaction_confirmation = await response.awaitMessageComponent({ filter: collector_filter_confirmation, time: 300000 })

            if (interaction_confirmation.customId === "confirmationOui") {
                if (fiche_rp[interaction.user.id]) {
                    interaction.editReply({
                        content: "Mais, vous avez déjà un personnage ! Un personnage par compte, pas plus !",
                        embeds: [],
                        components: []
                    }).then(() => {
                        setTimeout(() => {
                            interaction.deleteReply()
                        }, 10000)
                    })
                } else {
                    let data_to_create = ["nom", "prénom", "âge", "origine", "genre"]
                    fiche_rp[interaction.user.id] = {}

                    for (let i = 0; i < data_to_create.length; i++) {
                        const embed_question = new EmbedBuilder()
                            .setColor('Orange')
                            .setTitle(data_to_create[i].toUpperCase())
                            .setDescription(`Veuillez renseignez l'information demandée...`)
                            .setFooter({
                                text: "Seul le nom de famille est facultative (renseignez \"2357\" si le personnage n'en a pas)"
                            })

                        interaction.editReply({
                            content: "",
                            embeds: [embed_question],
                            components: []
                        })

                        const message_collector_question = await interaction.channel.awaitMessages({
                            filter: msg => msg.author.id === interaction.user.id,
                            max: 1,
                            time: 300000
                        }).then((collected) => {
                            let msg = collected.first()
                            console.log(msg);
                            fiche_rp[interaction.user.id][data_to_create[i]] = msg.content;
                            msg.delete()
                        }).catch(() => {
                            delete fiche_rp[interaction.user.id]
                            ErrorTemps().then(() => {
                                i = 1000;
                            });
                        })

                        await console.log(fiche_rp)
                    }
                }
            } else if (interaction_confirmation.customId === "confirmationNon") {
                interaction.editReply({
                    content: "Hmmm, d'accord, revenez me voir lorsque vous serez sûr !",
                    embeds: [],
                    components: []
                }).then(() => {
                    setTimeout(() => {
                        interaction.deleteReply()
                    }, 10000)
                })
            }
        } catch (err) {
            ErrorTemps()
            console.log(err)
        }

    },
};