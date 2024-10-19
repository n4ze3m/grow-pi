-- CreateTable
CREATE TABLE "Click" (
    "id" SERIAL NOT NULL,
    "click_count" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pi" (
    "id" BIGSERIAL NOT NULL,
    "pi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pi_pkey" PRIMARY KEY ("id")
);
