import type { EmbedBuilder, Message } from "discord.js";
import type { mapQueueSmart } from "../index";

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";



enum Button {
  first = "1",
  prev = "2",
  stop = "3",
  next = "4",
  last = "5",
}

const buttons = [
  {
    style: ButtonStyle.Primary,
    label: "First",
    emoji: "⏮️",
    customId: Button.first,
  },
  {
    style: ButtonStyle.Primary,
    label: "Prev",
    emoji: "◀️",
    customId: Button.prev,
  },
  {
    style: ButtonStyle.Danger,
    label: "Play",
    emoji: "▶️",
    customId: Button.stop,
  },
  {
    style: ButtonStyle.Primary,
    label: "Next",
    emoji: "▶️",
    customId: Button.next,
  },
  {
    style: ButtonStyle.Primary,
    label: "Last",
    emoji: "⏭️",
    customId: Button.last,
  },
];

export class Pagination {
  private message: Message;
  private pages: EmbedBuilder[];
  private indexPage = 0;
  private footerText = "Page";
  constructor(message: Message, pages: EmbedBuilder[]) {
    this.message = message;
    this.pages = pages;
  }
  async createEmbeds(mapQueueSmart: mapQueueSmart) {
    this.pages = this.pages.map((page: EmbedBuilder, pageIndex: number) => {
      if (
        page.data.footer &&
        (page.data.footer.text || page.data.footer.icon_url)
      )
        return page;
      return page.setFooter({
        text: `${this.footerText} ${pageIndex + 1} of ${this.pages.length}`,
      });
    });

    const message2 = await this.message.channel.send({
      embeds: [this.pages[this.indexPage]],
      // ...(this.files && { files: [this.files[this.index]] }),
      components: [
        new ActionRowBuilder<ButtonBuilder>({
          components: buttons.map((x) => {
            return new ButtonBuilder({
              emoji: x.emoji,
              style: ButtonStyle.Secondary,
              type: 2,
              label: x.label,
              customId: String(x.customId),
            });
          }),
        }),
      ],
    });

    const interactionCollector = message2.createMessageComponentCollector({
      max: this.pages.length * 5,
      filter: (x) => {
        // console.log(x)
        return true;
      },
    });
    interactionCollector.on("collect", async (interaction) => {
      //   console.log(interaction);
      const { customId } = interaction;

      let newIndex: number | undefined;
      switch (customId) {
        case Button.first:
          if (this.indexPage === 0) {
            interaction.reply({
              content: `${interaction?.member?.user} You idiot`,
              ephemeral: true,
            });
            return;
          }
          newIndex = 0;
          break;
        case Button.prev:
          if (this.indexPage > 0) {
            newIndex = this.indexPage - 1;
          } else {
            interaction.reply({
              content: `${interaction?.member?.user} You idiot\ni Cant move back`,
              ephemeral: true,
            });
            return;
          }

          break;

        case Button.stop: {
          // @ts-ignore
          const queue = mapQueueSmart.get(this.message?.guildId);
          if (queue) {
            // @ts-ignore
            queue.addMusic(this.pages[this.indexPage].data.fields[2].value);
            await interaction.reply({
              content: "Success added",
              ephemeral: true,
            });
            break;
          }
          await this.message.channel.send(
            "Активируй сначала плеер любым треком"
          );

          break;
        }

        case Button.next:
          if (this.indexPage !== this.pages.length - 1) {
            newIndex = this.indexPage + 1;
          } else {
            await interaction.reply({
              content: `${interaction?.member?.user} You idiot\ni Cant move next`,
              ephemeral: true,
            });
            return;
          }
          break;

        case Button.last:
          if (this.indexPage === this.pages.length - 1) {
            interaction.reply({
              content: `${interaction?.member?.user} You idiot`,
              ephemeral: true,
            });
            return;
          }
          newIndex = this.pages.length - 1;
          break;
        default:
          interaction.reply({
            content: `${interaction?.member?.user} You idiot`,
            ephemeral: true,
          });

          break;
      }
      if (newIndex !== undefined) {
        this.indexPage = newIndex;
        await interaction.update({
          embeds: [this.pages[newIndex]],
        });
      }
    });
  }
}
