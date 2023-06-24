const { Events } = require("discord.js");
const { writeFile } = require('fs')
const fiche_json = require("../database/fiche-rp.json")
function SaveFicheBDD() {
    writeFile(".database/fiche-rp.json", JSON.stringify(fiche_json), (err) => {})
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
                    
                }
            }
        }
        if (interaction.isModalSubmit()) {
        }


    }
}