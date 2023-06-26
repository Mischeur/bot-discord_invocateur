const { Events, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require("discord.js");
const { writeFile } = require('fs')
const fiche_json = require("../database/fiche-rp.json");
const { request } = require("undici");
function SaveFicheBDD() {
    writeFile("./database/fiche-rp.json", JSON.stringify(fiche_json), (err) => { })
}
function RéinitialiseDisableComponents(interaction) {
    const RéinitialiseDisableButton = new Promise((resolve) => {
        let messages_row_à_désac = interaction.channel.lastMessage
        let row_à_désac = messages_row_à_désac.components[0].components

        const row_désac = new ActionRowBuilder()

        for (let a = 0; a < row_à_désac.length; a++) {
            if (row_à_désac[a].type === ComponentType.Button) {
                const button_désac = new ButtonBuilder(row_à_désac[a].data).setDisabled(true).setStyle(ButtonStyle.Danger)
                row_désac.addComponents([button_désac])
            }
            if (row_à_désac[a].type === ComponentType.StringSelect) {
                const stringSelectMenu_désac = new StringSelectMenuBuilder(row_à_désac[a].data).setDisabled(true)
                row_désac.addComponents([stringSelectMenu_désac])
            }
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
                fiche_json[interaction.user.id]["prenom"] = prénom_fields
                fiche_json[interaction.user.id]["avance_histoire"] = "0.1"

                await interaction.guild.channels.create({
                    name: name,
                    type: ChannelType.GuildText,
                    topic: `Avancé dans l'histoire : ${fiche_json[interaction.user.id]["avance_histoire"]}`,
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
                        
                        Ah ! Bonjour ! Tu dois être... ${fiche_json[interaction.user.id]["prenom"]} ? Ah oui, je me disais bien que tu devais être une personne que je connaissais bien !
                        
                        Je sais que tu dois te dire ce que tu fais ici, dans une zone inter-dimensionnelle. Mais ne t'inquiètes pas, je vais t'expliquer... Alors, je me présente, moi c'est l'Invocateur, je suis une sorte de guide pour toutes personnes qui entrent dans le monde..., toutes les autres personnes comme toi possèdent un lien de communication avec moi !
                        
                        Mais avant de continuer, j'aimerais savoir... quel âge as-tu ?`,
                        footer: {
                            text: "Avancé de l'histoire : " + fiche_json[interaction.user.id]["avance_histoire"],
                        },
                        image: {
                            url: "https://wallpapers.com/images/hd/fantasy-space-0us40pagx65ges3f.jpg"
                        },
                    })
                        .setColor('Gold')
                        .setTimestamp()

                    channel.send({
                        embeds: [remplissage_infos_embeds],
                        components: [remplissage_infos_row]
                    })

                }).then(() => {
                    interaction.guild.channels.cache.get('1122131842125025350').permissionOverwrites.create(interaction.user.id, {
                        ViewChannel: true
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


        /** Renseignement d'informations supplémentaires **/
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
                const remplissage_infos_origine_input = new TextInputBuilder({
                    custom_id: "remplissage_infos_origine_input",
                    label: "Réponse",
                    placeholder: "France / Espagne / Chine...",
                    required: true,
                    style: TextInputStyle.Short,
                })

                const action_row_remplissage_infos_origine = new ActionRowBuilder({
                    components: [remplissage_infos_origine_input],
                })

                const modals_remplissage_infos_origine = new ModalBuilder({
                    components: [action_row_remplissage_infos_origine],
                    custom_id: "remplissage_infos_origine_modals",
                    title: "D'où viens ton personnage ?"
                })

                interaction.showModal(modals_remplissage_infos_origine)
            }
        }
        if (interaction.isModalSubmit()) {

            /** Âge **/
            if (interaction.customId === "remplissage_infos_âges_modals") {
                RéinitialiseDisableComponents(interaction).then(() => {
                    let âge_fields = interaction.fields.getTextInputValue("remplissage_infos_âges_input").replace(" ", "").replace('ans', "")
                    let âge_int = parseInt(âge_fields)
                    if (isNaN(âge_int)) {
                        const error_NaN_âge = new EmbedBuilder({
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.displayAvatarURL(),
                            },
                            description: `Alors, je ne peux pas te voir, mais je suis presque sûr que ce n'est pas ton âge... Même si c'est très drôle comme réponse... Mais plus sérieusement, quel âge as-tu ?`,
                            footer: {
                                text: "Avancé de l'histoire : " + fiche_json[interaction.user.id]["avance_histoire"],
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
                                text: "Avancé de l'histoire : " + fiche_json[interaction.user.id]["avance_histoire"],
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
                        fiche_json[interaction.user.id]["age"] = âge_fields
                        SaveFicheBDD()

                        const remplissage_infos_select_genre = new StringSelectMenuBuilder({
                            custom_id: "remplissage_infos_select_genre",
                            max_values: 1,
                            placeholder: "Répondre",
                            options: [
                                {
                                    label: "Homme",
                                    value: 'Homme',
                                    description: "Êtes-vous un homme ?",
                                    emoji: {
                                        name: "👦🏻"
                                    }
                                },
                                {
                                    label: "Femme",
                                    description: "Êtes-vous une femme ?",
                                    emoji: {
                                        name: "👩🏻"
                                    },
                                    value: "Femme"
                                },
                                {
                                    label: "Non-binaire",
                                    description: "Vous ne vous reconnaissez ni dans l'homme, ni dans la femme...",
                                    emoji: {
                                        name: "⚧"
                                    },
                                    value: "Non-binaire"
                                }
                            ]
                        })

                        const remplissage_infos_row_genre = new ActionRowBuilder({
                            components: [remplissage_infos_select_genre]
                        })

                        const remplissage_infos_embeds = new EmbedBuilder({
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.displayAvatarURL()
                            },
                            description: `Hmmm... Je vois que tu as ${fiche_json[interaction.user.id]["âge"] = âge_fields} ans... Je ne sais pas si c'est jeune ou pas, après tout, j'avais pris des valeurs au hasard pour le filtre de ma sélection. Bref, depuis tout à l'heure, je voulais t'appeler jeune homme ou jeune fille, mais je ne sais même pas quel est ton genre... Pourrais-tu m'aiguiller ?`,
                            footer: {
                                text: "Avancé de l'histoire : " + fiche_json[interaction.user.id]["avance_histoire"],
                            }
                        }).setColor('Gold').setTimestamp()

                        interaction.reply({
                            embeds: [remplissage_infos_embeds],
                            components: [remplissage_infos_row_genre]
                        })
                    }
                })
            }

            /** ORIGINE **/
            if (interaction.customId === "remplissage_infos_origine_modals") {
                RéinitialiseDisableComponents(interaction).then(async () => {
                    let origine_fields_a = interaction.fields.getTextInputValue("remplissage_infos_origine_input")
                    let origine_fields = `${origine_fields_a.charAt(0).toUpperCase()}${origine_fields_a.slice(1).toLowerCase()}`
                    const api_pays = await request('https://data.enseignementsup-recherche.gouv.fr/api/records/1.0/search/?dataset=curiexplore-pays&q=&sort=name_fr&facet=name_fr')
                    const pays_json = await api_pays.body.json();
                    let fiche_pays = pays_json["facet_groups"][0]["facets"].find(i => i["name"] === origine_fields)
                    if (!fiche_pays) {
                        const embed_pays_fiche_error = new EmbedBuilder({
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.displayAvatarURL()
                            },
                            description: `Hmmm... Je pense que tu t'es trompé, car je ne vois pas ton pays dans les registres de la Terre... Pourrais-tu essayer de vérifier l'orthographe ? Peut-être que c'est ça...`,
                            footer: {
                                text: "Avancé de l'histoire : " + fiche_json[interaction.user.id]["avance_histoire"],
                            }
                        }).setColor('Red')

                        const remplissage_infos_button_origine = new ButtonBuilder({
                            customId: "remplissage_infos_origine",
                            emoji: {
                                name: '💬'
                            },
                            label: 'Répondre',
                            style: ButtonStyle.Primary,
                            disabled: false
                        })
    
                        const remplissage_infos_row = new ActionRowBuilder({
                            components: [remplissage_infos_button_origine]
                        })

                        interaction.reply({
                            embeds: [embed_pays_fiche_error],
                            components: [remplissage_infos_row]
                        })
                    } else {
                        const embed_pays_fiche = new EmbedBuilder({
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.displayAvatarURL()
                            },
                            description: `Je vois... je vois... Donc tu viens de "${origine_fields}"... Je ne sais pas à quoi ça correspond, mais normalement tu n'auras pas la barrière de langue dans le monde. En effet, nous possédons notre propre langue universelle. Tu ne l'as peut-être pas remarqué mais je suis en ce moment en train de te parler avec cette langue universelle.
                            
                            Bref, tu peux maintenant continuer en appuyant sur le bouton "Suite". Je te détaillerai ensuite ta situation actuelle.`,
                            footer: {
                                text: "Avancé de l'histoire : " + fiche_json[interaction.user.id]["avance_histoire"],
                            }
                        }).setColor('Gold').setTimestamp()

                        const remplissage_infos_button_origine = new ButtonBuilder({
                            customId: "suite 0.1",
                            emoji: {
                                name: '➡️'
                            },
                            label: 'Suite',
                            style: ButtonStyle.Success,
                            disabled: false
                        })
    
                        const remplissage_infos_row = new ActionRowBuilder({
                            components: [remplissage_infos_button_origine]
                        })

                        interaction.reply({
                            embeds: [embed_pays_fiche],
                            components: [remplissage_infos_row]
                        }).then(() => {
                            fiche_json[interaction.user.id]['origine'] = origine_fields
                        })
                    }
                })
            }

        }
        if (interaction.isStringSelectMenu()) {
            /** Genre **/
            if (interaction.customId === "remplissage_infos_select_genre") {
                RéinitialiseDisableComponents(interaction).then(() => {
                    const choix_genre_select = interaction.values[0]

                    const remplissage_infos_embeds = new EmbedBuilder({
                        author: {
                            name: interaction.user.username,
                            icon_url: interaction.user.displayAvatarURL()
                        },
                        footer: {
                            text: "Avancé de l'histoire : " + fiche_json[interaction.user.id]["avance_histoire"],
                        },
                        description: `Hmmm... Je vois, donc tu es ${choix_genre_select === "Homme" ? "un homme" : (choix_genre_select === "Femme" ? "une femme" : "non-binaire")}. Je vois, bon après c'est juste pour connaître ton genre, cette information n'influe pas beaucoup sur ton aventure qui va suivre...
                        
                        Juste pour savoir, d'où viens-tu ? Non, je sais que tu viens de la Terre. Je te parle de ton pays d'origine.`
                    }).setColor('Gold').setTimestamp()

                    const remplissage_infos_button_origine = new ButtonBuilder({
                        customId: "remplissage_infos_origine",
                        emoji: {
                            name: '💬'
                        },
                        label: 'Répondre',
                        style: ButtonStyle.Primary,
                        disabled: false
                    })

                    const remplissage_infos_row = new ActionRowBuilder({
                        components: [remplissage_infos_button_origine]
                    })

                    interaction.reply({
                        embeds: [remplissage_infos_embeds],
                        components: [remplissage_infos_row]
                    }).then(() => {
                        fiche_json[interaction.user.id]["genre"] = choix_genre_select
                        SaveFicheBDD()
                    })
                })
            }
        }


    }
}