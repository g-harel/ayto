const {printTable} = require("console-table-printer");

const numWeeks = 10;
const numCouples = 11;

enum Boy {
    Anthony = "Anthony",
    Clinton = "Clinton",
    Dimitri = "Dimitri",
    Ethan = "Ethan",
    Joe = "Joe",
    Kareem = "Kareem",
    Keith = "Keith",
    Malcolm = "Malcolm",
    Michael = "Michael",
    Shad = "Shad",
    Tyler = "Tyler",
}

enum Girl {
    Alexis = "Alexis",
    Alivia = "Alivia",
    Audrey = "Audrey",
    Diandra = "Diandra",
    Geles = "Geles",
    Jada = "Jada",
    Keyana = "Keyana",
    Nicole = "Nicole",
    Nurys = "Nurys",
    Uche = "Uche",
    Zoe = "Zoe",
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

interface Week {
    booths: TruthBoothEvent[];
    beams: BeamCeremonyEvent;
}

type Matrix<T> = {
    [boy in Boy]: {
        [girl in Girl]: T;
    };
};

const flatten = (weeks: Week[]): [BeamCeremonyEvent[], TruthBoothEvent[]] => {
    const ceremonies: BeamCeremonyEvent[] = [];
    const booths: TruthBoothEvent[] = [];

    for (const week of weeks) {
        ceremonies.push(week.beams);
        booths.push(...week.booths);
    }

    return [ceremonies, booths];
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

const printMatrix = <T>(matrix: Matrix<T>) => {
    // TODO 202-07-22 round values and convert to percentage.
    // const flattened = Object.entries(matrix).map(([key, value]) => {
    //     return Object.assign({" ": key}, value);
    // });

    printTable(
        Object.entries(matrix).map(([key, value]) => {
            return Object.assign({" ": key}, value);
        }),
    );
};

printMatrix(
    calculateOdds(
        ...flatten([
            // Week 1
            {
                beams: {
                    beamCount: 1,
                    couples: [
                        {boy: Boy.Anthony, girl: Girl.Geles},
                        {boy: Boy.Clinton, girl: Girl.Uche},
                        {boy: Boy.Dimitri, girl: Girl.Diandra},
                        {boy: Boy.Ethan, girl: Girl.Jada},
                        {boy: Boy.Joe, girl: Girl.Zoe},
                        {boy: Boy.Kareem, girl: Girl.Alivia},
                        {boy: Boy.Keith, girl: Girl.Alexis},
                        {boy: Boy.Malcolm, girl: Girl.Nurys},
                        {boy: Boy.Michael, girl: Girl.Keyana},
                        {boy: Boy.Shad, girl: Girl.Audrey},
                        {boy: Boy.Tyler, girl: Girl.Nicole},
                    ],
                },
                booths: [
                    {boy: Boy.Ethan, girl: Girl.Keyana, isPerfectMatch: false},
                ],
            },
        ]),
    ),
);
