const {printTable} = require("console-table-printer");

const numWeeks = 10;
const numCouples = 10;

enum Boy {
    Asaf = "Asaf",
    Cam = "Cam",
    Cameron = "Cameron",
    Giovanni = "Giovanni",
    John = "John",
    Morgan = "Morgan",
    Prosper = "Prosper",
    Sam = "Sam",
    Stephen = "Stephen",
    Tyler = "Tyler",
}

enum Girl {
    Alyssa = "Alyssa",
    Camille = "Camille",
    Emma = "Emma",
    Francesca = "Francesca",
    Julia = "Julia",
    Kaylen = "Kaylen",
    Mikala = "Mikala",
    Nicole = "Nicole",
    Tori = "Tori",
    Victoria = "Victoria",
}

const boys = Object.keys(Boy);
const girls = Object.keys(Girl);

if (boys.length !== girls.length || girls.length !== numCouples) {
    throw "inconsistent number of participants";
}

interface Couple {
    boy: Boy;
    girl: Girl;
}

interface TruthBoothEvent extends Couple {
    isPerfectMatch: boolean;
}

interface BeamCeremonyEvent {
    beamCount: number;
    couples: Couple[];
}

type Matrix<T> = {
    [boy in Boy]: {
        [girl in Girl]: T;
    };
};

const calculateOdds = (
    ceremonies: BeamCeremonyEvent[],
    booths: TruthBoothEvent[],
): Matrix<number> => {
    // Create result array with zeroed out values.
    const result: Matrix<number> = {} as any;
    for (const boy of boys) {
        result[boy as any as Boy] = {} as any;
        for (const girl of girls) {
            result[boy as any as Boy][girl as any as Girl] = 0;
        }
    }

    // Add booths to the result.
    for (const booth of booths) {
        result[booth.boy][booth.girl] = booth.isPerfectMatch ? 1 : 0;
    }

    const ceremonyCount = ceremonies.length;
    for (const ceremony of ceremonies) {
        // Calculate beam ratios after removing solved couples.
        let beams = ceremony.beamCount;
        let possibleBeams = ceremony.couples.length;
        const unknownCouples: Couple[] = [];

        for (const couple of ceremony.couples) {
            let isKnown = false;
            for (const booth of booths) {
                if (couple.boy === booth.boy && couple.girl === booth.girl) {
                    isKnown = true;
                    if (booth.isPerfectMatch) {
                        beams--;
                    } else {
                        possibleBeams--;
                    }
                }
            }
            if (!isKnown) unknownCouples.push(couple);
        }

        if (beams === 0) {
            // TODO all unknowns are all no match, recurse.
        }
        // TODO condition where all unknown are match, recurse.

        for (const couple of unknownCouples) {
            result[couple.boy][couple.girl] +=
                beams / possibleBeams / ceremonyCount;
        }
    }
    return result;
};

const flatten = <T>(matrix: Matrix<T>): any[] => {
    return Object.entries(matrix).map(([key, value]) => {
        return Object.assign({" ": key}, value);
    });
};

printTable(
    flatten(
        calculateOdds(
            [
                {
                    beamCount: 1,
                    couples: [
                        {boy: Boy.Cam, girl: Girl.Emma},
                        {boy: Boy.Prosper, girl: Girl.Mikala},
                    ],
                },
                {
                    beamCount: 1,
                    couples: [
                        {boy: Boy.Cam, girl: Girl.Emma},
                        {boy: Boy.Prosper, girl: Girl.Victoria},
                    ],
                },
            ],
            [{isPerfectMatch: true, boy: Boy.Asaf, girl: Girl.Alyssa}],
        ),
    ),
);
