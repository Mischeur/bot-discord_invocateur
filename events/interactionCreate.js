const { Events, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { writeFile } = require('fs')
const fiche_json = require("../database/fiche-rp.json")
function SaveFicheBDD() {
    writeFile("./database/fiche-rp.json", JSON.stringify(fiche_json), (err) => { })
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
                            name: '🔢'
                        },
                        label: 'Âge',
                        style: ButtonStyle.Primary,
                        disabled: false
                    })

                    const remplissage_infos_button_genre = new ButtonBuilder({
                        customId: "remplissage_infos_genre",
                        emoji: {
                            name: '🚻'
                        },
                        label: 'Genre',
                        style: ButtonStyle.Primary,
                        disabled: false
                    })

                    const remplissage_infos_button_origine = new ButtonBuilder({
                        customId: "remplissage_infos_origine",
                        emoji: {
                            name: '🇫🇷'
                        },
                        label: 'Origine',
                        style: ButtonStyle.Primary,
                        disabled: false
                    })

                    const remplissage_infos_row = new ActionRowBuilder({
                        components: [remplissage_infos_button_âge, remplissage_infos_button_genre, remplissage_infos_button_origine]
                    })

                    const remplissage_infos_embeds = new EmbedBuilder({
                        author: {
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL()
                        },
                        title: "Ajout d'informations complémentaires",
                        description: "Félicitation ! Tu as réussi la première étape de ta création d'informations !\n\nPour l'instant, tu as seulement le prénom et le nom, ou seulement le nom... Il te reste maintenant plus qu'à renseigner les autres informations nécessaires à ce pseudo tutoriel !",
                    })
                        .setColor('LuminousVividPink')
                        .setTimestamp()

                    channel.send({
                        embeds: [remplissage_infos_embeds],
                        components: [remplissage_infos_row]
                    })

                }).then(() => {
                    SaveFicheBDD()
                })



                await interaction.reply({
                    content: "Fécilitation ! Le personnage a correctement été créé !",
                    ephemeral: true
                })
            }
        }


    }
}