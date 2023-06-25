const { Events, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { writeFile } = require('fs')
const fiche_json = require("../database/fiche-rp.json")
function SaveFicheBDD() {
    writeFile("./database/fiche-rp.json", JSON.stringify(fiche_json), (err) => { })
}
function RéinitialiseDisableButton(interaction) {
    const RéinitialiseDisableButton = new Promise((resolve) => {
        let messages_row_à_désac = interaction.channel.lastMessage
        let row_à_désac = messages_row_à_désac.components[0].components
    
        const row_désac = new ActionRowBuilder()
    
        for (let a = 0; a < row_à_désac.length; a++) {
            const button_désac = new ButtonBuilder(row_à_désac[a].data).setDisabled(true).setStyle(ButtonStyle.Danger)
            row_désac.addComponents([button_désac])
        }
    
        messages_row_à_désac.edit({
            embeds: messages_row_à_désac.embeds,
            components: [row_désac]
        }).then(() => {
            resolve()
        })
    })

    return RéinitialiseDisableButton
}


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {


        /** Création d'un personnage **/
        if (interaction.isButton()) {
            if (interaction.customId === "creation_perso_button") {
                if (fiche_json[interaction.user.id]) {
                    interaction.reply({
                        content: "Vous avez déjà créé un personnage !",
                        ephemeral: true
                    })
                } else {
                    const text_input_nom = new TextInputBuilder({
                        customId: "question_input_nom",
                        label: "Nom du personnage",
                        required: false,
                        style: TextInputStyle.Short,
                        min_length: 2,
                    })
                    const text_input_prénom = new TextInputBuilder({
                        customId: "question_input_prénom",
                        label: "Prénom du personnage",
                        required: true,
                        style: TextInputStyle.Short,
                        min_length: 2,
                    })

                    const action_row_question_nom = new ActionRowBuilder({ components: [text_input_nom] })
                    const action_row_question_prénom = new ActionRowBuilder({ components: [text_input_prénom] })

                    const modals_questionnaire1 = new ModalBuilder({
                        components: [action_row_question_nom, action_row_question_prénom],
                        customId: "questionnaire_modals_1",
                        title: "Création d'un personnage"
                    })

                    await interaction.showModal(modals_questionnaire1)
                }
            }
        }
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "questionnaire_modals_1") {
                let nom_fields = interaction.fields.getTextInputValue("question_input_nom")
                let prénom_fields = interaction.fields.getTextInputValue("question_input_prénom")

                let name = `${nom_fields}_${prénom_fields}`
                if (nom_fields === "") {
                    name = `${prénom_fields}`
                }

                function nom(nooo) {
                    if (nooo === "") {
                        return "()"
                    }
                    return nom_fields
                }

                fiche_json[interaction.user.id] = {}
                fiche_json[interaction.user.id]["nom"] = nom_fields
                fiche_json[interaction.user.id]["prénom"] = prénom_fields
                fiche_json[interaction.user.id]["avancé_histoire"] = "0.1"

                await interaction.guild.channels.create({
                    name: name,
                    type: ChannelType.GuildText,
                    topic: `Avancé dans l'histoire : ${fiche_json[interaction.user.id]["avancé_histoire"]}`,
                    permissionOverwrites: [
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ],
                    parent: interaction.channel.parent
                }).then((channel) => {
                    const remplissage_infos_button_âge = new ButtonBuilder({
                        customId: "remplissage_infos_âge",
                        emoji: {
                            name: '💬'
                        },
                        label: 'Répondre',
                        style: ButtonStyle.Primary,
                        disabled: false
                    })

                    const remplissage_infos_row = new ActionRowBuilder({
                        components: [remplissage_infos_button_âge]
                    })

                    const remplissage_infos_embeds = new EmbedBuilder({
                        author: {
                            name: interaction.user.username,
                            icon_url: interaction.user.displayAvatarURL()
                        },
                        description: `Hmmm...
                        
                        Ah ! Bonjour ! Tu dois être... ${fiche_json[interaction.user.id]["prénom"]} ? Ah oui, je me disais bien que tu devais être une personne que je connaissais bien !
                        
                        Je sais que tu dois te dire ce que tu fais ici, dans une zone inter-dimensionnelle. Mais ne t'inquiètes pas, je vais t'expliquer... Alors, je me présente, moi c'est l'Invocateur, je suis une sorte de guide pour toutes personnes qui entrent dans le monde..., toutes les autres personnes comme toi possèdent un lien de communication avec moi !
                        
                        Mais avant de continuer, j'aimerais savoir... quel âge as-tu ?`,
                        footer: {
                            text: "Avancé de l'histoire : " + fiche_json[interaction.user.id]["avancé_histoire"],
                        },
                        image: {
                            url: "https://wallpapers.com/images/hd/fantasy-space-0us40pagx65ges3f.jpg"
                        },
                    })
                        .setColor('LuminousVividPink')
                        .setTimestamp()

                    channel.send({
                        embeds: [remplissage_infos_embeds],
                        components: [remplissage_infos_row]
                    })

                }).then(() => {
                    interaction.guild.channels.edit("1122131842125025350", {
                        permissionOverwrites: [
                            {
                                id: interaction.user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel]
                            },
                        ]
                    })
                }).then(() => {
                    const joueur_rp_role = interaction.guild.roles.cache.get('914595477150892093')
                    interaction.member.roles.add(joueur_rp_role)
                }).then(() => {
                    SaveFicheBDD()
                })



                await interaction.reply({
                    content: "Fécilitation ! Le personnage a correctement été créé !",
                    ephemeral: true
                })
            }
        }


        /** Renseignement d'informations supplémentaire **/
        if (interaction.isButton()) {

            /** ÂGE **/
            if (interaction.customId === "remplissage_infos_âge") {
                const remplissage_infos_âges_input = new TextInputBuilder({
                    custom_id: "remplissage_infos_âges_input",
                    label: "Réponse",
                    placeholder: "9 ~ 40",
                    min_length: 1,
                    max_length: 2,
                    required: true,
                    style: TextInputStyle.Short,
                })

                const action_row_remplissage_infos_âges = new ActionRowBuilder({
                    components: [remplissage_infos_âges_input],
                })

                const modals_remplissage_infos_âges = new ModalBuilder({
                    components: [action_row_remplissage_infos_âges],
                    custom_id: "remplissage_infos_âges_modals",
                    title: "Quel est l'âge de ton personnage ?"
                })

                interaction.showModal(modals_remplissage_infos_âges)
            }

            /** ORIGINE **/
            if (interaction.customId === "remplissage_infos_origine") {

            }

            /** GENRE **/
            if (interaction.customId === "remplissage_infos_genre") {

            }

        }
        if (interaction.isModalSubmit()) {

            /** Âge **/
            if (interaction.customId === "remplissage_infos_âges_modals") {
                RéinitialiseDisableButton(interaction).then(() => {
                    let âge_fields = interaction.fields.getTextInputValue("remplissage_infos_âges_input")
                    let âge_int = parseInt(âge_fields)
                    if (isNaN(âge_int)) {
                        const error_NaN_âge = new EmbedBuilder({
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.displayAvatarURL(),
                            },
                            description: `Alors, je ne peux pas te voir, mais je suis presque sûr que ce n'est pas ton âge... Même si c'est très drôle comme réponse... Mais plus sérieusement, quel âge as-tu ?`,
                            footer: {
                                text: "Avancé de l'histoire : " + fiche_json[interaction.user.id]["avancé_histoire"],
                            },
                        }).setColor('Red')

                        const remplissage_infos_button_âge = new ButtonBuilder({
                            customId: "remplissage_infos_âge",
                            emoji: {
                                name: '💬'
                            },
                            label: 'Répondre',
                            style: ButtonStyle.Primary,
                            disabled: false
                        })
    
                        const remplissage_infos_row = new ActionRowBuilder({
                            components: [remplissage_infos_button_âge]
                        })

                        interaction.reply({
                            embeds: [error_NaN_âge],
                            components: [remplissage_infos_row]
                        })
                    } else if (âge_int > 40 || âge_int < 9) {
                        const error_NaN_âge = new EmbedBuilder({
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.displayAvatarURL(),
                            },
                            description: `Alors... Il me semble que tu es trop ${âge_int > 40 ? "âgé(e)" : "jeune"} pour rejoindre l'aventure... Normalement, la tranche d'âge que je m'étais défini était d'entre 9 ans et 40 ans. Mais dans ce cas, je pense que tu te moques un peu de moi. Plus sérieusement, quel âge as-tu ?`,
                            footer: {
                                text: "Avancé de l'histoire : " + fiche_json[interaction.user.id]["avancé_histoire"],
                            },
                        }).setColor('Red')

                        const remplissage_infos_button_âge = new ButtonBuilder({
                            customId: "remplissage_infos_âge",
                            emoji: {
                                name: '💬'
                            },
                            label: 'Répondre',
                            style: ButtonStyle.Primary,
                            disabled: false
                        })
    
                        const remplissage_infos_row = new ActionRowBuilder({
                            components: [remplissage_infos_button_âge]
                        })

                        interaction.reply({
                            embeds: [error_NaN_âge],
                            components: [remplissage_infos_row]
                        })
                    } else {
                        
                    }
                })
            }

        }


    }
}