const { Events, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ComponentType } = require("discord.js");
const { writeFile } = require('fs')


const fiche_json = require("../database/fiche-rp.json");
const { request } = require("undici");
function SaveFicheBDD() {
    const save = new Promise((resolve) => {
        writeFile("./database/fiche-rp.json", JSON.stringify(fiche_json), (err) => {
            if (err) {
                console.log(fiche_json)
                console.log(err)
            } else {
                resolve()
            }
        })
    })

    return save
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


function CreateEmbedChannelGestion(interaction) {
    const embed = new EmbedBuilder({
        author: {
            name: interaction.user.username,
            icon_url: interaction.user.displayAvatarURL()
        },
        footer: {
            text: "Avancé de l'histoire : " + fiche_json[interaction.user.id]["avance_histoire"],
        },
    }).setTimestamp().setColor('Gold')

    return embed
}

/**
 * @param {object} stats
 */
function StatsEmbedsAjoutStats0_2(interaction, stats) {

    return CreateEmbedChannelGestion(interaction).setTitle('Gestion des statistiques').addFields([
        {
            name: "Force :",
            value: stats['force'].toString(),
            inline: true
        },
        {
            name: "Agilité :",
            value: stats['agilite'].toString(),
            inline: true
        },
        {
            name: "Endurance :",
            value: stats['endurance'].toString(),
            inline: true
        },
        {
            name: "Dextérité :",
            value: stats['dexterite'].toString(),
            inline: true
        },
        {
            name: "Mental :",
            value: stats['mental'].toString(),
            inline: true
        }
    ]).setFooter({
        text: `Reste ${stats['restante']} point${stats['restante'] > 1 ? "s" : ""} de stats à distribuer !`
    })
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
                fiche_json[interaction.user.id]['générals'] = {}
                fiche_json[interaction.user.id]['générals']["nom"] = nom_fields
                fiche_json[interaction.user.id]['générals']["prenom"] = prénom_fields
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

                    channel.send({
                        embeds: [
                            CreateEmbedChannelGestion(interaction)
                                .setDescription(
                                    `L'Invocateur se tient devant le portail inter-dimensionnel, son regard fixe et pénétrant fixé sur l'horizon. Les brumes mystiques tourbillonnent autour de lui, alors qu'une aura de puissance imprègne l'atmosphère. Soudain, une âme émerge de l'abysse inter-dimensionnel, portant le nom de "${fiche_json[interaction.user.id]['générals']["prenom"]}". L'Invocateur incline légèrement la tête en signe de bienvenue.

"L'âme nommée ${fiche_json[interaction.user.id]['générals']["prenom"]}, je me présente, je me prénomme "l'Invocateur", gardien des portes dimensionnelles vers Xeadelyn et guide des Voyageurs. Je suis ici pour t'accueillir dans notre monde, en tant que Voyageur de Terra. Ta présence ici est le fruit d'une invocation puissante, et ton destin est désormais lié à celui de Xeadelyn."

L'Invocateur laisse planer un instant de silence, laissant à Jean le temps de s'adapter à la situation. Puis, il poursuit : "Avant que nous ne commencions ton périple, laisse-moi te demander : Quel âge as-tu, ${fiche_json[interaction.user.id]['générals']["prenom"]} ? Cela nous permettra de mieux comprendre ton parcours et de t'offrir les opportunités les plus appropriées dans notre monde."

L'Invocateur attend patiemment, prêt à recevoir la réponse de ${fiche_json[interaction.user.id]['générals']["prenom"]}, sachant que chaque voyageur apporte avec lui une histoire unique à dévoiler dans les méandres de Xeadelyn.`
                                )
                                .setImage("https://wallpapers.com/images/hd/fantasy-space-0us40pagx65ges3f.jpg")
                        ],
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


        /** 0.1 : Renseignement d'informations supplémentaires **/
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
                            description: `L'Invocateur lève un sourcil, perplexe face à la réponse de ${fiche_json[interaction.user.id]['générals']["prenom"]} indiquant un âge qui n'est pas valide pour l'invocation. Un soupçon de suspicion teinte son regard, mais il décide d'aborder la situation avec humour. Un sourire amusé se dessine sur ses lèvres.

"Ah, ${fiche_json[interaction.user.id]['générals']["prenom"]}, je vois que tu tentes de me jouer un tour. Une plaisanterie, en effet. Mais souviens-toi que les énergies inter-dimensionnelles sont sensibles aux subtilités de l'âge. Voyons si nous pouvons être plus sérieux cette fois-ci. Retente ta chance et donne-moi ton véritable âge, si tu le veux bien."

L'Invocateur laisse un bref moment de silence, attendant que ${fiche_json[interaction.user.id]['générals']["prenom"]} comprenne qu'il est nécessaire de répondre de manière sincère et précise. Il attend avec une certaine impatience la réponse correcte de ${fiche_json[interaction.user.id]['générals']["prenom"]}.`,
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
                            description: `L'Invocateur arque un sourcil, surpris par la réponse de ${fiche_json[interaction.user.id]['générals']["prenom"]} indiquant un âge qui se situe en dehors des limites d'invocation. Un sourire amusé se dessine sur son visage, réalisant que cela pourrait être une tentative de plaisanterie. Néanmoins, il décide de donner une chance à ${fiche_json[interaction.user.id]['générals']["prenom"]} de se reprendre.

"Hmm, ${fiche_json[interaction.user.id]['générals']["prenom"]}, je soupçonne que tu tentes de me taquiner avec cet âge qui se situe en dehors de nos limites d'invocation. Une plaisanterie, sans doute. Mais rappelle-toi que l'univers inter-dimensionnel est imprévisible et peut réserver bien des surprises. Allons, soyons sérieux maintenant. Je t'invite à réessayer et à me donner ton véritable âge, si tu le souhaites."

L'Invocateur affiche un léger sourire, attendant avec curiosité et amusement la réponse correcte de ${fiche_json[interaction.user.id]['générals']["prenom"]}. Il espère que cette fois-ci, ${fiche_json[interaction.user.id]['générals']["prenom"]} fournira une réponse valide, lui permettant de poursuivre son voyage dans le monde de Xeadelyn en tant que Voyageur de Terra.`,
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
                        fiche_json[interaction.user.id]['générals']["age"] = âge_fields
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

                        interaction.reply({
                            embeds: [
                                CreateEmbedChannelGestion(interaction)
                                    .setDescription(
                                        `L'Invocateur acquiesce d'un léger mouvement de tête à la réponse de Jean. "Bien, ${fiche_json[interaction.user.id]['générals']["prenom"]}, à présent je sais que tu as ${fiche_json[interaction.user.id]['générals']["age"]} ans. Un âge où la passion de l'aventure brûle souvent ardemment dans le cœur des Voyageurs. Que Xeadelyn te réserve de grandes opportunités."

Un sourire bienveillant se dessine sur les lèvres de l'Invocateur, tandis qu'il poursuit : "Maintenant, ${fiche_json[interaction.user.id]['générals']["prenom"]}, pour mieux façonner ton voyage dans notre monde, pour comprendre les enjeux et les relations que tu tisseras, pour donner vie à ton personnage, dis-moi, quel est ton genre ?"

L'Invocateur attend avec patience et respect la réponse de ${fiche_json[interaction.user.id]['générals']["prenom"]}, conscient que le genre joue un rôle crucial dans la manière dont chaque individu interagit avec le monde qui l'entoure, et cela ne fait pas exception dans le vaste royaume de Xeadelyn.`
                                    )
                            ],
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
                            description: `L'Invocateur fronce les sourcils légèrement en entendant la réponse de ${fiche_json[interaction.user.id]["générals"]['prenom']} concernant le pays d'origine de son âme, un pays qui ne correspond à aucun sur Terre. Un soupçon de perplexité traverse son regard, mais il choisit de ne pas remettre en question cette réponse inhabituelle.

"Ah, je vois, un pays bien mystérieux, ${fiche_json[interaction.user.id]["générals"]['prenom']}. Une réponse surprenante et inattendue. Peut-être est-ce une allusion à une contrée cachée au-delà des frontières de notre réalité. Xeadelyn est un monde rempli de merveilles et d'inexploré, après tout."

L'Invocateur sourit, jouant le jeu et laissant place à l'imagination de ${fiche_json[interaction.user.id]["générals"]['prenom']}. "Mais je te propose une autre chance, ${fiche_json[interaction.user.id]["générals"]['prenom']}. Laisse-moi reformuler ma question : quel est le pays d'origine de ton âme dans la réalité que tu connaissais auparavant ?"

L'Invocateur attend avec curiosité la nouvelle réponse de ${fiche_json[interaction.user.id]["générals"]['prenom']}, prêt à poursuivre l'aventure de ce Voyageur dans le monde de Xeadelyn.`,
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
                            description: `L'Invocateur, intrigué par la réponse de ${fiche_json[interaction.user.id]['générals']['prenom']}, se perd brièvement dans une réflexion sur le pays d'origine évoqué. "Hmm, ce pays exotique évoque des images de contrées lointaines et mystérieuses. Peut-être est-il doté de traditions uniques, de paysages enchanteurs ou d'une histoire captivante. Ah, les nombreux secrets que renferme notre monde, et voilà que nous découvrons encore davantage de mystères à travers ton origine, ${fiche_json[interaction.user.id]['générals']['prenom']}."

L'Invocateur reprend sa posture majestueuse, sa voix empreinte d'une certaine solennité. "${fiche_json[interaction.user.id]['générals']['prenom']}, tu t'es révélé être un Voyageur fascinant, porteur d'un âge, d'un genre et d'une origine singulière. Maintenant, il est temps de poursuivre ton périple à travers Xeadelyn. Pour cela, il te suffit d'appuyer sur le bouton 'suite' afin de continuer le tutoriel et d'embrasser pleinement les aventures qui t'attendent."`,
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
                            fiche_json[interaction.user.id]['générals']['origine'] = origine_fields
                            SaveFicheBDD()
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
                        description: `L'Invocateur écoute attentivement la réponse de ${fiche_json[interaction.user.id]['générals']['prenom']} concernant son genre, prêt à accueillir toutes les possibilités. Son expression reste neutre, respectueux de l'individualité de chacun.

"Merci de partager cette information, ${fiche_json[interaction.user.id]['générals']['prenom']}. Que tu sois un homme, une femme ou une personne non-binaire, sache que Xeadelyn accueille et célèbre la diversité de tous ses Voyageurs. Les frontières de ce monde sont ouvertes à tous, sans distinction de genre."
                        
L'Invocateur marque une légère pause avant de poursuivre : "Maintenant, ${fiche_json[interaction.user.id]['générals']['prenom']}, avant de poursuivre ton voyage, pour mieux te comprendre et t'accompagner, j'aimerais savoir d'où vient ton âme. Quel est le pays d'origine qui t'a vu naître dans ton ancienne réalité ?"
                        
L'Invocateur attend avec bienveillance la réponse de Jean, conscient que l'origine peut apporter une richesse culturelle et une perspective unique au périple de ce Voyageur dans le monde de Xeadelyn.`,
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
                        fiche_json[interaction.user.id]['générals']["genre"] = choix_genre_select
                        SaveFicheBDD()
                    })
                })
            }
        }


        /** 0.2 : Statistiques **/
        if (interaction.isButton()) {

            console.log(interaction.customId)

            /** Introductions */
            if (interaction.customId === "suite 0.1") {
                RéinitialiseDisableComponents(interaction).then(() => {
                    fiche_json[interaction.user.id]["avance_histoire"] = "0.2"
                    interaction.channel.edit({
                        topic: `Avancé dans l'histoire : ${fiche_json[interaction.user.id]["avance_histoire"]}`
                    })
                    SaveFicheBDD()
                }).then(() => {
                    const choisir_stats_button = new ButtonBuilder({
                        custom_id: "0.2 choisir_stats_button",
                        label: "Distribuer les statistiques",
                        style: ButtonStyle.Primary,
                        emoji: {
                            name: "🉑"
                        }
                    })

                    const choisir_stats_row = new ActionRowBuilder({
                        components: [choisir_stats_button]
                    })

                    interaction.reply({
                        embeds: [
                            CreateEmbedChannelGestion(interaction).setDescription(
                                `Alors... Maintenant que tu m'as donné toutes tes informations, il faut que je t'attribue tes statistiques... Ah ? Tu ne sais pas ce que c'est ? Bon, je t'explique rapidement...
                                
(variation en fonction des situations)
**Force** : 
| - Attaque non-magique en combat : 2* (DGTs)
| - Dés de force : 1*
| - Coup critique : 1*
| | => Moyenne d'un citoyen lambda : 2 ~ 3

**Agilité** :
| - Esquive : 1*
| - Fuite : 1*
| - Mouvement technique : 1*
| - Attaque en premier : 1*
| | => Moyenne d'un citoyen lambda : 1 ~ 2

**Endurance** :
| - Points de vie : 8*
| - Résistance physique : 2*
| - Résistance magique : 2*
| | => Moyenne d'un citoyen lambda : 2 ~ 3

**Dextérité** :
| - Dés de fabrication : 1*
| - Dés de modification sur un objet : 1*
| - Précision des attaques (coup critique) : 0.5*
| | => Moyenne d'un citoyen lambda : 1 ~ 2

**Mental** :
| - Volonté : 1*
| - Résistance mentale : 1.5*
                                
PS : Un dé est réussi si la valeur est positive (en rajoutant les résultats des dés qui l'annulent).`
                            )
                        ],
                        components: [choisir_stats_row]
                    })
                })
            }

            /** Choix des stats **/
            let perso_fiche_stats = ""
            if (fiche_json[interaction.user.id]) {
                if (fiche_json[interaction.user.id]["stats"]) {
                    perso_fiche_stats = fiche_json[interaction.user.id]["stats"]
                }
            }
            const row = new ActionRowBuilder()
            let stats = ["Force", "Agilité", "Dextérité", "Endurance", "Mental"]

            for (let i = 0; i < stats.length; i++) {
                const button = new ButtonBuilder({
                    custom_id: `0.2 choisir_stats_add_${stats[i].toLowerCase().replace('é', 'e').replace('é',"e")}`,
                    style: ButtonStyle.Primary,
                    label: stats[i],
                    emoji: {
                        name: '🆙'
                    }
                })
                row.addComponents([button])
            }
            if (interaction.customId === "0.2 choisir_stats_button") {
                RéinitialiseDisableComponents(interaction).then(() => {
                    fiche_json[interaction.user.id]["stats"] = {}
                    fiche_json[interaction.user.id]["stats"]["force"] = 1
                    fiche_json[interaction.user.id]["stats"]["agilite"] = 1
                    fiche_json[interaction.user.id]["stats"]["dexterite"] = 1
                    fiche_json[interaction.user.id]["stats"]["endurance"] = 1
                    fiche_json[interaction.user.id]["stats"]["mental"] = 1
                    fiche_json[interaction.user.id]["stats"]["restante"] = 15
                    SaveFicheBDD()
                }).then(() => {
                    perso_fiche_stats = fiche_json[interaction.user.id]["stats"]
                    interaction.reply({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row]
                    })
                })
            }
            if (interaction.customId === "0.2 choisir_stats_add_force") {
                if (perso_fiche_stats['restante'] === 0) {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    }).then(() => {
                        RéinitialiseDisableComponents(interaction).then(() => {

                        })
                    })
                }
                perso_fiche_stats['force']++
                perso_fiche_stats['restante']--
                SaveFicheBDD()
                if (perso_fiche_stats['restante'] === 0) {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    }).then(() => {
                        RéinitialiseDisableComponents(interaction).then(() => {
                            const button_suite_0_2 = new ButtonBuilder({
                                customId: "suite 0.2",
                                emoji: {
                                    name: '➡️'
                                },
                                label: 'Suite',
                                style: ButtonStyle.Success,
                                disabled: false
                            })

                            const row = new ActionRowBuilder({
                                components: [button_suite_0_2]
                            })

                            interaction.reply({
                                embeds: [
                                    CreateEmbedChannelGestion(interaction).setDescription(
`Hmmm... Maintenant que tes statistiques ont été attribuées, il est temps de te révéler un don spécial, ${fiche_json[interaction.user.id]['générals']['prenom']}. Ce don te conférera un pouvoir unique, une capacité extraordinaire qui te distinguera des autres Voyageurs de Terra. Hmmm... Prépare-toi à découvrir ton potentiel caché et à maîtriser ce pouvoir pour accomplir des prouesses incroyables.

Ce don peut prendre différentes formes, ${fiche_json[interaction.user.id]['générals']['prenom']}, allant de la maîtrise de la magie élémentaire à des compétences de combat exceptionnelles, en passant par des talents de guérison ou même des aptitudes de perception accrue. Hmmm... Il te permettra de surmonter les obstacles et d'affronter les défis qui se dresseront sur ta route avec une force et une ingéniosité inégalées.

Lors de ton voyage, tu découvriras et développeras davantage ton don, en apprenant de puissantes techniques et en libérant son potentiel ultime. Hmmm... Mais rappelle-toi, avec un grand pouvoir vient une grande responsabilité. Utilise ton don avec sagesse et discernement, car chaque choix que tu feras aura des conséquences sur ton chemin.

Maintenant, ${fiche_json[interaction.user.id]['générals']['prenom']}, je t'invite à fermer les yeux et à te connecter à l'essence de Xeadelyn. Hmmm... Sens le pouvoir se réveiller en toi, une énergie qui pulse dans tes veines. Lorsque tu ouvriras les yeux, tu découvriras ton don, une manifestation de ton potentiel unique.`
                                    )
                                ],
                                components: [row]
                            })

                        })
                    })
                } else {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    })
                    interaction.reply({
                        content: 'Ajouté !',
                        ephemeral: true
                    })
                }
            }
            if (interaction.customId === "0.2 choisir_stats_add_dexterite") {
                if (perso_fiche_stats['restante'] === 0) {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    }).then(() => {
                        RéinitialiseDisableComponents(interaction).then(() => {

                        })
                    })
                }
                perso_fiche_stats['dexterite']++
                perso_fiche_stats['restante']--
                SaveFicheBDD()
                if (perso_fiche_stats['restante'] === 0) {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    }).then(() => {
                        RéinitialiseDisableComponents(interaction).then(() => {
                            const button_suite_0_2 = new ButtonBuilder({
                                customId: "suite 0.2",
                                emoji: {
                                    name: '➡️'
                                },
                                label: 'Suite',
                                style: ButtonStyle.Success,
                                disabled: false
                            })

                            const row = new ActionRowBuilder({
                                components: [button_suite_0_2]
                            })

                            interaction.reply({
                                embeds: [
                                    CreateEmbedChannelGestion(interaction).setDescription(
`Hmmm... Maintenant que tes statistiques ont été attribuées, il est temps de te révéler un don spécial, ${fiche_json[interaction.user.id]['générals']['prenom']}. Ce don te conférera un pouvoir unique, une capacité extraordinaire qui te distinguera des autres Voyageurs de Terra. Hmmm... Prépare-toi à découvrir ton potentiel caché et à maîtriser ce pouvoir pour accomplir des prouesses incroyables.

Ce don peut prendre différentes formes, ${fiche_json[interaction.user.id]['générals']['prenom']}, allant de la maîtrise de la magie élémentaire à des compétences de combat exceptionnelles, en passant par des talents de guérison ou même des aptitudes de perception accrue. Hmmm... Il te permettra de surmonter les obstacles et d'affronter les défis qui se dresseront sur ta route avec une force et une ingéniosité inégalées.

Lors de ton voyage, tu découvriras et développeras davantage ton don, en apprenant de puissantes techniques et en libérant son potentiel ultime. Hmmm... Mais rappelle-toi, avec un grand pouvoir vient une grande responsabilité. Utilise ton don avec sagesse et discernement, car chaque choix que tu feras aura des conséquences sur ton chemin.

Maintenant, ${fiche_json[interaction.user.id]['générals']['prenom']}, je t'invite à fermer les yeux et à te connecter à l'essence de Xeadelyn. Hmmm... Sens le pouvoir se réveiller en toi, une énergie qui pulse dans tes veines. Lorsque tu ouvriras les yeux, tu découvriras ton don, une manifestation de ton potentiel unique.`
                                    )
                                ],
                                components: [row]
                            })

                        })
                    })
                } else {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    })
                    interaction.reply({
                        content: 'Ajouté !',
                        ephemeral: true
                    })
                }
            }
            if (interaction.customId === "0.2 choisir_stats_add_mental") {
                if (perso_fiche_stats['restante'] === 0) {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    }).then(() => {
                        RéinitialiseDisableComponents(interaction).then(() => {

                        })
                    })
                }
                perso_fiche_stats['mental']++
                perso_fiche_stats['restante']--
                SaveFicheBDD()
                if (perso_fiche_stats['restante'] === 0) {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    }).then(() => {
                        RéinitialiseDisableComponents(interaction).then(() => {
                            const button_suite_0_2 = new ButtonBuilder({
                                customId: "suite 0.2",
                                emoji: {
                                    name: '➡️'
                                },
                                label: 'Suite',
                                style: ButtonStyle.Success,
                                disabled: false
                            })

                            const row = new ActionRowBuilder({
                                components: [button_suite_0_2]
                            })

                            interaction.reply({
                                embeds: [
                                    CreateEmbedChannelGestion(interaction).setDescription(
`Hmmm... Maintenant que tes statistiques ont été attribuées, il est temps de te révéler un don spécial, ${fiche_json[interaction.user.id]['générals']['prenom']}. Ce don te conférera un pouvoir unique, une capacité extraordinaire qui te distinguera des autres Voyageurs de Terra. Hmmm... Prépare-toi à découvrir ton potentiel caché et à maîtriser ce pouvoir pour accomplir des prouesses incroyables.

Ce don peut prendre différentes formes, ${fiche_json[interaction.user.id]['générals']['prenom']}, allant de la maîtrise de la magie élémentaire à des compétences de combat exceptionnelles, en passant par des talents de guérison ou même des aptitudes de perception accrue. Hmmm... Il te permettra de surmonter les obstacles et d'affronter les défis qui se dresseront sur ta route avec une force et une ingéniosité inégalées.

Lors de ton voyage, tu découvriras et développeras davantage ton don, en apprenant de puissantes techniques et en libérant son potentiel ultime. Hmmm... Mais rappelle-toi, avec un grand pouvoir vient une grande responsabilité. Utilise ton don avec sagesse et discernement, car chaque choix que tu feras aura des conséquences sur ton chemin.

Maintenant, ${fiche_json[interaction.user.id]['générals']['prenom']}, je t'invite à fermer les yeux et à te connecter à l'essence de Xeadelyn. Hmmm... Sens le pouvoir se réveiller en toi, une énergie qui pulse dans tes veines. Lorsque tu ouvriras les yeux, tu découvriras ton don, une manifestation de ton potentiel unique.`
                                    )
                                ],
                                components: [row]
                            })

                        })
                    })
                } else {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    })
                    interaction.reply({
                        content: 'Ajouté !',
                        ephemeral: true
                    })
                }
            }
            if (interaction.customId === "0.2 choisir_stats_add_endurance") {
                if (perso_fiche_stats['restante'] === 0) {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    }).then(() => {
                        RéinitialiseDisableComponents(interaction).then(() => {

                        })
                    })
                }
                perso_fiche_stats['endurance']++
                perso_fiche_stats['restante']--
                SaveFicheBDD()
                if (perso_fiche_stats['restante'] === 0) {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    }).then(() => {
                        RéinitialiseDisableComponents(interaction).then(() => {
                            const button_suite_0_2 = new ButtonBuilder({
                                customId: "suite 0.2",
                                emoji: {
                                    name: '➡️'
                                },
                                label: 'Suite',
                                style: ButtonStyle.Success,
                                disabled: false
                            })

                            const row = new ActionRowBuilder({
                                components: [button_suite_0_2]
                            })

                            interaction.reply({
                                embeds: [
                                    CreateEmbedChannelGestion(interaction).setDescription(
`Hmmm... Maintenant que tes statistiques ont été attribuées, il est temps de te révéler un don spécial, ${fiche_json[interaction.user.id]['générals']['prenom']}. Ce don te conférera un pouvoir unique, une capacité extraordinaire qui te distinguera des autres Voyageurs de Terra. Hmmm... Prépare-toi à découvrir ton potentiel caché et à maîtriser ce pouvoir pour accomplir des prouesses incroyables.

Ce don peut prendre différentes formes, ${fiche_json[interaction.user.id]['générals']['prenom']}, allant de la maîtrise de la magie élémentaire à des compétences de combat exceptionnelles, en passant par des talents de guérison ou même des aptitudes de perception accrue. Hmmm... Il te permettra de surmonter les obstacles et d'affronter les défis qui se dresseront sur ta route avec une force et une ingéniosité inégalées.

Lors de ton voyage, tu découvriras et développeras davantage ton don, en apprenant de puissantes techniques et en libérant son potentiel ultime. Hmmm... Mais rappelle-toi, avec un grand pouvoir vient une grande responsabilité. Utilise ton don avec sagesse et discernement, car chaque choix que tu feras aura des conséquences sur ton chemin.

Maintenant, ${fiche_json[interaction.user.id]['générals']['prenom']}, je t'invite à fermer les yeux et à te connecter à l'essence de Xeadelyn. Hmmm... Sens le pouvoir se réveiller en toi, une énergie qui pulse dans tes veines. Lorsque tu ouvriras les yeux, tu découvriras ton don, une manifestation de ton potentiel unique.`
                                    )
                                ],
                                components: [row]
                            })

                        })
                    })
                } else {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    })
                    interaction.reply({
                        content: 'Ajouté !',
                        ephemeral: true
                    })
                }
            }
            if (interaction.customId === "0.2 choisir_stats_add_agilite") {
                if (perso_fiche_stats['restante'] === 0) {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    }).then(() => {
                        RéinitialiseDisableComponents(interaction).then(() => {

                        })
                    })
                }
                perso_fiche_stats['agilite']++
                perso_fiche_stats['restante']--
                SaveFicheBDD()
                if (perso_fiche_stats['restante'] === 0) {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    }).then(() => {
                        RéinitialiseDisableComponents(interaction).then(() => {
                            const button_suite_0_2 = new ButtonBuilder({
                                customId: "suite 0.2",
                                emoji: {
                                    name: '➡️'
                                },
                                label: 'Suite',
                                style: ButtonStyle.Success,
                                disabled: false
                            })

                            const row = new ActionRowBuilder({
                                components: [button_suite_0_2]
                            })

                            interaction.reply({
                                embeds: [
                                    CreateEmbedChannelGestion(interaction).setDescription(
`Hmmm... Maintenant que tes statistiques ont été attribuées, il est temps de te révéler un don spécial, ${fiche_json[interaction.user.id]['générals']['prenom']}. Ce don te conférera un pouvoir unique, une capacité extraordinaire qui te distinguera des autres Voyageurs de Terra. Hmmm... Prépare-toi à découvrir ton potentiel caché et à maîtriser ce pouvoir pour accomplir des prouesses incroyables.

Ce don peut prendre différentes formes, ${fiche_json[interaction.user.id]['générals']['prenom']}, allant de la maîtrise de la magie élémentaire à des compétences de combat exceptionnelles, en passant par des talents de guérison ou même des aptitudes de perception accrue. Hmmm... Il te permettra de surmonter les obstacles et d'affronter les défis qui se dresseront sur ta route avec une force et une ingéniosité inégalées.

Lors de ton voyage, tu découvriras et développeras davantage ton don, en apprenant de puissantes techniques et en libérant son potentiel ultime. Hmmm... Mais rappelle-toi, avec un grand pouvoir vient une grande responsabilité. Utilise ton don avec sagesse et discernement, car chaque choix que tu feras aura des conséquences sur ton chemin.

Maintenant, ${fiche_json[interaction.user.id]['générals']['prenom']}, je t'invite à fermer les yeux et à te connecter à l'essence de Xeadelyn. Hmmm... Sens le pouvoir se réveiller en toi, une énergie qui pulse dans tes veines. Lorsque tu ouvriras les yeux, tu découvriras ton don, une manifestation de ton potentiel unique.`
                                    )
                                ],
                                components: [row]
                            })

                        })
                    })
                } else {
                    interaction.message.edit({
                        embeds: [
                            StatsEmbedsAjoutStats0_2(interaction, perso_fiche_stats)
                        ],
                        components: [row],
                    })
                    interaction.reply({
                        content: 'Ajouté !',
                        ephemeral: true
                    })
                }
            }
        }


        /** 0.3 : Choix du don **/
        if (interaction.isButton()) {
            
        }

    }
}