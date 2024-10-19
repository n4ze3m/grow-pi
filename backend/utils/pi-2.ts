import { BigNumber } from 'bignumber.js';

export function getPi(decimals: number): string {
    const internalPrecision = decimals + 15;
    BigNumber.config({ DECIMAL_PLACES: internalPrecision, ROUNDING_MODE: BigNumber.ROUND_DOWN });

    const C = new BigNumber(426880).times(new BigNumber(10005).sqrt());
    let L = new BigNumber(13591409);
    let X = new BigNumber(1);
    let M = new BigNumber(1);
    let K = new BigNumber(6);
    let S = new BigNumber(13591409);

    const iterations = Math.ceil(decimals / 14) + 1;

    for (let i = 1; i < iterations; i++) {
        M = M.times(K.pow(3).minus(K.times(16))).dividedBy(new BigNumber(i).pow(3));
        L = L.plus(545140134);
        X = X.times(-262537412640768000);
        S = S.plus(M.times(L).dividedBy(X));
        K = K.plus(12);
    }

    const pi = C.dividedBy(S);

    return pi.toFixed(decimals, BigNumber.ROUND_DOWN);
}