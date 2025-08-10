let CLOTHWIDTH = 14;
let CLOTHHEIGHT = 15;

// CLOTHWIDTH = 3;
// CLOTHHEIGHT = 2;

const POINTSGAPX = (W - 50) / CLOTHWIDTH;
const POINTSGAPY = (H - 50) / CLOTHHEIGHT;

const CLOTH = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

const TCLOTH = [
    [1, 1, 1],
    [0, 0, 0]
]


//JOINING POINTS TO CREATE THE CLOTH
for (let i = 0; i < CLOTHHEIGHT; i++) {
    for (let j = 0; j < CLOTHWIDTH; j++) {
        let a = false;
        if (CLOTH[i][j] == 1) {
            a = true;
        }
        let coord = j + i * CLOTHWIDTH;
        createPoint(25 + j * POINTSGAPX, 25 + i * POINTSGAPY, 1000, coord, a);
    }
}

//joining points in rows
for (let i = 0; i < CLOTHHEIGHT; i++) {
    for (let j = 0; j < CLOTHWIDTH - 1; j++) {
        let jointsCoord = j + i * CLOTHWIDTH;
        createLineJoint(OGPOINTS[jointsCoord], OGPOINTS[jointsCoord + 1]);
    }
}

//joining points in columns

for (let j = 0; j < CLOTHWIDTH; j++) {
    for (let i = 0; i < CLOTHHEIGHT - 1; i++) {
        let jointsCoord = j + i * CLOTHWIDTH;
        createLineJoint(OGPOINTS[jointsCoord], OGPOINTS[jointsCoord + CLOTHWIDTH]);
    }
}