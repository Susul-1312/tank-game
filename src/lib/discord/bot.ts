import { Gateway } from "@purplet/gateway";
import { GatewayIntentBits, APIInteraction } from "discord-api-types/v10";
import { Rest } from "@purplet/rest";
import Board from "../logic/board";
import Tank from "../logic/tank";
import renderPNG from "../render/png";
import { TankError } from "../shared-types";

const client = new Gateway({
    token: process.env.DISCORD_TOKEN!,
    intents: GatewayIntentBits.GuildMessages
});
const rest = new Rest({
    token: process.env.DISCORD_TOKEN!
});

const board: Board = new Board(10, 10);
const tanks: Map<string, Tank> = new Map();

client.on("INTERACTION_CREATE", async (interaction) => {
    console.log(interaction);

    if (!interaction.data) return;

    const data = interaction.data

    // @ts-ignore
    const interactionName: string = data.name

    if (interactionName == "addtank") {
        // @ts-ignore
        const tankname: string = data.options[0].value;
        console.log(`Adding tank ${tankname}`);
        const tank = new Tank(tankname);
        tanks.set(tank.name, tank);
        board.addTank(tank);
        respondToInteraction(interaction, `Added tank ${tankname}`);
    }

    if (interactionName == "removetank") {
        // @ts-ignore
        const tankname: string = data.options[0].value;
        console.log(`Removing tank ${tankname}`);
        const tank = tanks.get(tankname);
        if (!tank) {
            respondToInteraction(interaction, `Tank ${tankname} not found`);
            return;
        }
        board.removeTank(tank);
        tanks.delete(tank.name);
        respondToInteraction(interaction, `Removed tank ${tankname}`);
    }

    if (interactionName == "movetank") {
        // @ts-ignore
        const tankname: string = data.options[0].value;
        // @ts-ignore
        const direction: string = data.options[1].value;
        if (direction != "up" && direction != "down" && direction != "left" && direction != "right") {
            respondToInteraction(interaction, `Invalid direction ${direction}`);
            return;
        }
        const tank = tanks.get(tankname);
        if (!tank) {
            respondToInteraction(interaction, `Tank ${tankname} not found`);
            return;
        }
        console.log(`Moving tank ${tankname} ${direction}`);
        try {
            board.moveTank(tank, direction);
            respondToInteraction(interaction, `Moved tank ${tankname} ${direction}`);
        } catch (e) {
            if (e instanceof TankError) {
                respondToInteraction(interaction, e.message);
            } else
                throw e;
        }
    }

    if (interactionName == "showboard") {
        console.log(`Rendering board`);
        const attachment = await renderPNG(board.board);
        respondToInteraction(interaction, `Rendered board`, attachment);
    }

    if (interactionName == "shoottank") {
        // @ts-ignore
        const shootername: string = data.options[0].value;
        // @ts-ignore
        const shooteename: string = data.options[1].value;
        const shooter = tanks.get(shootername);
        const shootee = tanks.get(shooteename);
        if (!shooter) {
            respondToInteraction(interaction, `Tank ${shootername} not found`);
            return;
        }
        if (!shootee) {
            respondToInteraction(interaction, `Tank ${shooteename} not found`);
            return;
        }
        console.log(`Shooting tank ${shootername} at ${shooteename}`);
        try {
            shooter.attack(shootee)
            respondToInteraction(interaction, `Shot tank ${shootername} at ${shooteename}`);
        } catch (e) {
            if (e instanceof TankError) {
                respondToInteraction(interaction, e.message);
            } else
                throw e;
        }
    }

    if (interactionName == "transferchips") {
        // @ts-ignore
        const sender: string = data.options[0].value;
        // @ts-ignore
        const receiver: string = data.options[1].value;
        // @ts-ignore
        const amount: number = data.options[2].value;
        const senderTank = tanks.get(sender);
        const receiverTank = tanks.get(receiver);
        if (!senderTank) {
            respondToInteraction(interaction, `Tank ${sender} not found`);
            return;
        }
        if (!receiverTank) {
            respondToInteraction(interaction, `Tank ${receiver} not found`);
            return;
        }
        console.log(`Transferring ${amount} chips from ${sender} to ${receiver}`);
        try {
            senderTank.transferChips(amount, receiverTank);
            respondToInteraction(interaction, `Transferred ${amount} chips from ${sender} to ${receiver}`);
        } catch (e) {
            if (e instanceof TankError) {
                respondToInteraction(interaction, e.message);
            } else
                throw e;
        }
    }

    if (interactionName == "upgrade") {
        // @ts-ignore
        const tankname: string = data.options[0].value;
        const tank = tanks.get(tankname);
        if (!tank) {
            respondToInteraction(interaction, `Tank ${tankname} not found`);
            return;
        }
        console.log(`Upgrading tank ${tankname}`);
        try {
            tank.upgrade();
            respondToInteraction(interaction, `Upgraded tank ${tankname}`);
        } catch (e) {
            if (e instanceof TankError) {
                respondToInteraction(interaction, e.message);
            } else
                throw e;
        }
    }
});

function respondToInteraction(interaction: APIInteraction, message: string, attachment?: Buffer): void {
    console.log(`Responding to interaction ${interaction.id} with message ${message}`);
    rest.interactionResponse.createInteractionResponse({
        interactionId: interaction.id,
        interactionToken: interaction.token,
        body: {
            type: 4,
            data: {
                content: message
            }
        },
        files: attachment ? [{
            name: "board.png",
            data: attachment
        }] : []
    })
}