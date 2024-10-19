import express from "express";
import cors from "cors";
import { getPi } from "./utils/pi-3";
import { PrismaClient } from "@prisma/client";
import { EventEmitter } from "events";

const prisma = new PrismaClient();
const piEmitter = new EventEmitter();

const PORT = process.env.PORT || 8000;

const app = express();

app.use(cors());

app.use(express.json());

const API_PATH = "/api/v1";

app.get(API_PATH + "/health", (req, res) => {
  return res.send("OK");
});

app.post(API_PATH + "/click", async (req, res) => {
  try {
    const turnstileToken = req.body.turnstileToken;

    if (!turnstileToken) {
      return res.status(400).json({
        message: "Missing turnstile token",
      });
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_TOKEN,
        response: turnstileToken,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({
        message: "Invalid turnstile token",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const count = await tx.click.upsert({
        where: {
          id: 1,
        },
        update: {
          click_count: {
            increment: 1,
          },
        },
        create: {
          click_count: 2,
        },
      });

      const pi = await getPi(Number(count.click_count));

      await tx.pi.create({
        data: {
          pi,
        },
      });

      return { count, pi };
    }, {
      timeout: 10_000_000
    })

    piEmitter.emit("newPi", result.pi);

    return res.json({
      message: "Updated",
      pi: result.pi,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
app.get(API_PATH + "/pi/stream", async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const sendUpdate = (data: string) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const piListener = (pi: string) => {
    sendUpdate(pi);
  };

  try {
    const latestPi = await prisma.pi.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (latestPi) {
      sendUpdate(latestPi.pi);
    }
  } catch (error) {
    console.error("Error fetching initial Pi:", error);
  }

  piEmitter.on("newPi", piListener);

  req.on("close", () => {
    piEmitter.off("newPi", piListener);
  });
});

app.get(API_PATH + "/pi", async (req, res) => {
  try {
    const latestPi = await prisma.pi.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      pi: latestPi?.pi || "3.14"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
