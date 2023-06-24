const { Events, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, ChannelType, PermissionsBitField } = require("discord.js");
const { writeFile } = require('fs')
const fiche_json = require("../database/fiche-rp.json")
function SaveFicheBDD() {
    writeFile("./database/fiche-rp.json", JSON.stringify(fiche_json), (err) => {})
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        
        /** Création d'un personnage **/
        if (interaction.isButton()) {
            if (interaction.customId === "creation_perso_button") {
                if (fiche_json[interaction.user.id]) {
                    interaction.deferReply({
                        ephemeral: true
                    }).then(() => {
                        setTimeout(() => {
                            interaction.editReply({
                                content: "Vous avez déjà créé un personnage !"
                            })
                        }, 2000)
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
            if(interaction.customId === "questionnaire_modals_1") {
                let nom_fields = interaction.fields.getTextInputValue("question_input_nom")
                let prénom_fields = interaction.fields.getTextInputValue("question_input_prénom")

                let name = `${nom_fields}_${prénom_fields}`
                if(nom_fields === "") {
                    name = `${prénom_fields}`
                }

                fiche_json[interaction.user.id] = {}
                fiche_json[interaction.user.id]["nom"] = nom_fields
                fiche_json[interaction.user.id]["prénom"] = prénom_fields
                fiche_json[interaction.user.id]["avancé_histoire"] = "0.1"
                SaveFicheBDD()

                const channel_gestion = await interaction.guild.channels.create({
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
                })

                

                await interaction.reply({
                    content: "Fécilitation ! Le personnage a correctement été créé !",
                    ephemeral: true
                })
            }
        }


    }
}