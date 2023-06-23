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
                    // fiche_rp[interaction.user.id] += {
                    //     name: "Test"
                    // }
                    // writeFile('./database/fiche-rp.json', JSON.stringify(fiche_rp), (err) => {})
                    // var infos_à_rentrer = ["nom", "prénom", "âge", "genre", "origine"]
                    // let nom = ""
                    // let prénom = ""
                    // let âge = ""
                    // let genre = ""
                    // let origine = ""
                    // for (let i = 0; i < infos_à_rentrer.length; i++) {
                    //     let article = ""
                    //     if(i === (0 || 1 ||3)) {
                    //         article = "le "
                    //     } else {
                    //         article = "l'"
                    //     }

                    //     const embed_question = new EmbedBuilder()
                    //         .setColor('Orange')
                    //         .setTitle(infos_à_rentrer[i].toUpperCase())
                    //         .setDescription(`Veuillez renseignez ${article}${infos_à_rentrer[i]} de votre personnage...`)

                    //     interaction.editReply({
                    //         content: "",
                    //         embeds: [embed_question],
                    //         components: []
                    //     })

                    //     var interaction_question_collector = new MessageCollector(interaction.channel, {
                    //         filter: collector_filter_confirmation,
                    //         time: 300000,
                    //         max: 1
                    //     })

                    //     interaction_question_collector.on('collect', (message) => {
                    //         switch (infos_à_rentrer[i]) {
                    //             case "nom":
                    //                 nom = message
                    //             case "prénom":
                    //                 prénom = message
                    //             case "origine":
                    //                 origine = message
                    //             case "âge":
                    //                 âge = message
                    //             case "genre":
                    //                 genre = message
                    //         }
                    //     })
                    // }

                    // /***********************************************/
                    // /*************** INITIALISATION ****************/
                    // /***********************************************/

                    // fiche_rp[interaction.user.id] = {}

                    // /***********************************************/
                    // /******************** NOM **********************/
                    // /***********************************************/

                    // const embed_question_nom = new EmbedBuilder()
                    //     .setColor('Orange')
                    //     .setTitle("NOM")
                    //     .setDescription(`Veuillez renseignez le nom de famille de votre personnage...`)
                    //     .setFooter({
                    //         text: "Si le personnages n'en a pas, merci de renseignez le chiffre \"2093\""
                    //     })

                    // interaction.editReply({
                    //     content: "",
                    //     embeds: [embed_question_nom],
                    //     components: []
                    // })

                    // const message_collector_question_nom = interaction.channel.createMessageCollector({
                    //     filter: msg => msg.author.id === interaction.user.id,
                    //     max: 1,
                    //     time: 300_000
                    // })

                    // message_collector_question_nom.on('collect', message => {
                    //     let res = message.content
                    //     fiche_rp[interaction.user.id]["nom"] = res
                    // })

                    // message_collector_question_nom.on('end', (collected, reason) => {
                    //     if (reason == "time") {
                    //         fiche_rp.deleteProperty(interaction.user.id)
                    //         ErrorTemps()
                    //     }

                    //     /***********************************************/
                    //     /******************** PRENOM **********************/
                    //     /***********************************************/

                    //     const embed_question_prénom = new EmbedBuilder()
                    //         .setColor('Orange')
                    //         .setTitle("PRENOM")
                    //         .setDescription(`Veuillez renseignez le prénom (ou surnom) de votre personnage...`)
                    //         .setFooter({
                    //             text: "Obligatoire"
                    //         })

                    //     interaction.editReply({
                    //         content: "",
                    //         embeds: [embed_question_prénom],
                    //         components: []
                    //     })

                    //     const message_collector_question_prénom = interaction.channel.createMessageCollector({
                    //         filter: msg => msg.author.id === interaction.user.id,
                    //         max: 1,
                    //         time: 300_000
                    //     })

                    //     message_collector_question_prénom.on('collect', message => {
                    //         let res = message.content
                    //         fiche_rp[interaction.user.id]["prénom"] = res
                    //     })

                    //     message_collector_question_prénom.on('end', (collected, reason) => {
                    //         if (reason == "time") {
                    //             fiche_rp.deleteProperty(interaction.user.id)
                    //             ErrorTemps()
                    //         }

                    //         /***********************************************/
                    //         /******************** ÂGE **********************/
                    //         /***********************************************/

                    //         const embed_question_âge = new EmbedBuilder()
                    //             .setColor('Orange')
                    //             .setTitle("ÂGE")
                    //             .setDescription(`Veuillez renseignez l'âge de votre personnage...`)
                    //             .setFooter({
                    //                 text: "Obligatoire"
                    //             })

                    //         interaction.editReply({
                    //             content: "",
                    //             embeds: [embed_question_âge],
                    //             components: []
                    //         })

                    //         const message_collector_question_âge = interaction.channel.createMessageCollector({
                    //             filter: msg => msg.author.id === interaction.user.id,
                    //             max: 1,
                    //             time: 300_000
                    //         })

                    //         message_collector_question_âge.on('collect', message => {
                    //             let res = message.content
                    //             let valide = false
                    //             try {
                    //                 parseFloat(res)
                    //                 res+0
                    //                 fiche_rp[interaction.user.id]["âge"] = res
                    //             } catch {
                    //                 while (!valide) {
                    //                     interaction.editReply({
                    //                         content: "Veuillez renseignez une valeur chiffrée...",
                    //                         embeds: [],
                    //                         components: []
                    //                     })

                    //                     const message_collector_question_âge2 = interaction.channel.createMessageCollector({
                    //                         filter: msg => msg.author.id === interaction.user.id,
                    //                         max: 1,
                    //                         time: 300_000
                    //                     })

                    //                     message_collector_question_âge2.on('collect', message => {
                    //                         let res = message.content
                    //                         try {
                    //                             parseFloat(res)
                    //                             res+0
                    //                             fiche_rp[interaction.user.id]["âge"] = res
                    //                             valide = true
                    //                         } catch {
                    //                             return
                    //                         }
                    //                     })

                    //                     message_collector_question_âge2.on('end', (collected, reason) => {
                    //                         if (reason == "time") {
                    //                             fiche_rp.deleteProperty(interaction.user.id)
                    //                             ErrorTemps()
                    //                         }
                    //                     })
                    //                 }
                    //             }
                    //         })

                    //         message_collector_question_âge.on('end', (collected, reason) => {
                    //             if (reason == "time") {
                    //                 fiche_rp.deleteProperty(interaction.user.id)
                    //                 ErrorTemps()
                    //             }

                    //             /***********************************************/
                    //             /******************** GENRE **********************/
                    //             /***********************************************/

                    //             const embed_question_genre = new EmbedBuilder()
                    //                 .setColor('Orange')
                    //                 .setTitle("GENRE")
                    //                 .setDescription(`Veuillez renseignez le genre de votre personnage...`)
                    //                 .setFooter({
                    //                     text: "Obligatoire"
                    //                 })

                    //             interaction.editReply({
                    //                 content: "",
                    //                 embeds: [embed_question_genre],
                    //                 components: []
                    //             })

                    //             const message_collector_question_genre = interaction.channel.createMessageCollector({
                    //                 filter: msg => msg.author.id === interaction.user.id,
                    //                 max: 1,
                    //                 time: 300_000
                    //             })

                    //             message_collector_question_genre.on('collect', message => {
                    //                 let res = message.content
                    //                 fiche_rp[interaction.user.id]["genre"] = res
                    //             })

                    //             message_collector_question_genre.on('end', (collected, reason) => {
                    //                 if (reason == "time") {
                    //                     fiche_rp.deleteProperty(interaction.user.id)
                    //                     ErrorTemps()
                    //                 }
                    //             })
                    //         })

                    //     })
                    // })


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
                        const message_collector_question = new MessageCollector(interaction.channel, {
                            filter: msg => msg.author.id === interaction.user.id,
                            max: 1,
                            time: 300000
                        })

                        message_collector_question.on('collect', msg => {
                            let res = msg.content;
                            fiche_rp[interaction.user.id][data_to_create[i]] = res;
                        })

                        message_collector_question.on('end', (c, reason) => {
                            if (reason === 'time') {
                                fiche_rp.deleteProperty(interaction.user.id);
                                ErrorTemps().then(() => {
                                    i = 1000;
                                });
                            }
                        })

                        while (!message_collector_question.ended) {
                            setTimeout(() => { }, 1000)
                        }
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