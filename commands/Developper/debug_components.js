const { PermissionFlagsBits, ContextMenuCommandBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("debug_components")
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        let messages_row_à_désac = interaction.channel.messages.cache.get(interaction.targetId)
        try {
            let row_à_désac = messages_row_à_désac.components[0].components

            const row_désac = new ActionRowBuilder()

            for (let a = 0; a < row_à_désac.length; a++) {
                if (row_à_désac[a].type === ComponentType.Button) {
                    const button_désac = new ButtonBuilder(row_à_désac[a].data).setDisabled(false).setStyle(ButtonStyle.Primary)
                    row_désac.addComponents([button_désac])
                }
                if (row_à_désac[a].type === ComponentType.StringSelect) {
                    const stringSelectMenu_désac = new StringSelectMenuBuilder(row_à_désac[a].data).setDisabled(false)
                    row_désac.addComponents([stringSelectMenu_désac])
                }
            }

            messages_row_à_désac.edit({
                embeds: messages_row_à_désac.embeds,
                components: [row_désac]
            })

            interaction.reply({
                content: "Debug success",
                ephemeral: true
            })
        } catch (err) {
            interaction.reply({
                content: "Il n'y a pas de **components** !",
                ephemeral: true
            })
        }
    }
}