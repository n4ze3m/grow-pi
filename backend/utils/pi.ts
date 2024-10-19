import { BigNumber } from 'bignumber.js';

export function getPi(decimals: number): string {

    const internalPrecision = decimals + 15;
    BigNumber.config({ DECIMAL_PLACES: internalPrecision, ROUNDING_MODE: BigNumber.ROUND_DOWN });

    let a = new BigNumber(1);
    let b = new BigNumber(1).dividedBy(new BigNumber(2).sqrt());
    let t = new BigNumber(1).dividedBy(4);
    let p = new BigNumber(1);

    const iterations = Math.max(5, Math.ceil(Math.log2(decimals)));

    for (let i = 0; i < iterations; i++) {
        let aNext = a.plus(b).dividedBy(2);
        let bNext = a.times(b).sqrt();
        let tNext = t.minus(p.times(a.minus(aNext).pow(2)));
        let pNext = p.times(2);

        a = aNext;
        b = bNext;
        t = tNext;
        p = pNext;
    }

    const pi = a.plus(b).pow(2).dividedBy(t.times(4));

    return pi.toFixed(decimals, BigNumber.ROUND_DOWN);
}
