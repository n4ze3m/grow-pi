export async function getPi(decimals: number): Promise<string> {
    const file = Bun.file("./assets/pi.txt")
    const text = await file.text()
    const pi = text.slice(0, decimals)
    return `3.${pi}`
}
