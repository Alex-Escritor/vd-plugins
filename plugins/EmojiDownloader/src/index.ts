import { logger } from "@vendetta";
import { registerCommand } from "@vendetta/commands";
import { findByStoreName } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { Clipboard, findInReactTree } from "@vendetta/metro/common";
import { showConfirmationAlert } from "@vendetta/ui/alerts";

let unregister;

const ChannelStore = findByStoreName("ChannelStore");
const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const EmojiStore = findByStoreName("EmojiStore");

export default {
  onLoad: () => {
    logger.log("EmojiDownloader plugin loaded!");

    unregister = registerCommand({
      name: "emoji",
      displayName: "emoji",
      description: "Commands for emojis",
      displayDescription: "Commands for emojis",
      options: [
        {
          name: "descargar",
          displayName: "descargar",
          description: "Get all emoji URLs from the current server",
          displayDescription: "Get all emoji URLs from the current server",
          type: 1, // SUB_COMMAND
          execute: (args, ctx) => {
            try {
              const guildId = ChannelStore.getChannel(SelectedChannelStore.getChannelId())?.guild_id;
              if (!guildId) {
                showToast("You must be in a server to use this command.", "ic_close");
                return;
              }

              const emojis = EmojiStore.getGuilds()[guildId]?.emojis;
              if (!emojis || emojis.length === 0) {
                showToast("This server has no emojis.", "ic_close");
                return;
              }

              const urls = emojis.map(e => `https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? "gif" : "png"}?v=1`).join("\n");
              
              showConfirmationAlert({
                title: "Server Emojis",
                content: `There are ${emojis.length} emojis on this server. Do you want to copy all their URLs?`,
                confirmText: "Copy URLs",
                confirmColor: "brand",
                onConfirm: () => {
                  Clipboard.setString(urls);
                  showToast(`Copied ${emojis.length} emoji URLs to clipboard.`, "ic_copy_24px");
                },
                cancelText: "Cancel",
              });

            } catch (err) {
              logger.error("EmojiDownloader failed:", err);
              showToast("An error occurred while getting emojis.", "ic_close");
            }
          },
        },
      ],
      applicationId: "-1",
      inputType: 1,
      type: 1,
    });
  },
  onUnload: () => {
    logger.log("EmojiDownloader plugin unloaded!");
    unregister?.();
  },
};
