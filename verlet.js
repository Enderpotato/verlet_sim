let OGPOINTS = [];
let OGJOINTS = [];

const FORCESCALECONSTANT = 1 / 1000;
let DRAGCOE = 0.1;
const SPRINGJOINTFORCE = 1;

let canvas;


function createPoint(x, y, m, coord, a = false) {
    let p = new Point(x, y, m, coord, a);
    OGPOINTS.push(p);
}

function createLineJoint(p0, p1, isSpring = false, springConstant = 0) {
    let l = new LineJoint(p0, p1, isSpring, springConstant);
    Object.seal(l);
    OGJOINTS.push(l);
}

//---UI operators---

//edit mode
let editMode = true;
let remove_single_particles
let addPoint, addJoint;

//point edit-mode
let point_anchor;
let point_mass_label;
let point_mass;

//joint edit-mode
let joint_isSpring;
let joint_springConstant_label;
let joint_springConstant;

let erase_button;

//settings
let showSingleParticles = true,
    toggle_show_single_particles;
let background_alpha_slider, background_alpha_label;
let applyGForce = true,
    applyGForceButton;
let applyDrag = true;
let applyDragButton, dragCoeLabel, dragCoeSlider;


let points = OGPOINTS;
let joints = OGJOINTS;

function cloneObjArray(arr) {
    return arr.map(obj => {
        if (obj == null) return null;
        return new Point(obj.x, obj.y, obj.mass, obj.id, obj.anchored);
    })
}

function cloneJoints(p_arr) {
    let final_joints_array = [];
    for (let joint of OGJOINTS) {
        let p0 = joint.p0;
        let p1 = joint.p1;

        //get id(coordinates) of both points
        let index0 = p0.id;
        let index1 = p1.id;

        //create new line joint connecting those points
        final_joints_array.push(new LineJoint(p_arr[index0], p_arr[index1], joint.isSpring, joint.springConstant))
    };
    return final_joints_array;
}

const toggleMode = () => {
    if (!editMode) {
        editMode = true;
        points = OGPOINTS;
        joints = OGJOINTS;
    } else {
        editMode = false;
        points = cloneObjArray(OGPOINTS);
        joints = cloneJoints(points);
    }
}

const clearAllPoints = () => {
    if (!editMode) return;
    OGPOINTS = [];
    OGJOINTS = [];
}
let mouseMode = "scissors";

const toggleEditMode = (mode) => {
    if (mouseMode == mode) {
        mouseMode = "scissors";
        return;
    }
    mouseMode = mode;
    return;
}


const W = 500;
const H = 550;

let wind_icon, scissors_icon, eraser_icon;

const FORCES = [];
let G, WINDFORCE;
const WINDSTRENGTH = 10;
let FRAMERATE;


function preload() {
    wind_icon = loadImage("https://cdn-icons-png.flaticon.com/512/3731/3731279.png");
    scissors_icon = loadImage("https://cdn-icons-png.flaticon.com/512/541/541957.png");
    eraser_icon = loadImage("https://cdn-icons-png.flaticon.com/512/1693/1693964.png");
}

let ind;
let toggleButton;

function setup() {
    canvas = createCanvas(500, 550).parent("canvasImg");

    //icons and images
    wind_icon.resize(25, 25);
    scissors_icon.resize(25, 25);
    eraser_icon.resize(25, 25);

    //default vectors
    G = createVector(0, 9.81);
    WINDFORCE = createVector(0, 0);

    //dev info
    createButton("no loop").mousePressed(noLoop).parent("dev-info");
    FRAMERATE = createP().style("display: inline; margin-left: 10px; margin-right: 10px;").parent("dev-info");
    ind = createP().style("display: inline;").parent("dev-info");

    //UI
    toggleButton = createButton("Play").id("toggle-button").mousePressed(toggleMode).parent("edit-mode").class("op-button");
    addPoint = createButton("Add point").mousePressed(() => toggleEditMode("point")).parent("edit-mode").class("op-button").id("point-button");
    addJoint = createButton("Add joint").mousePressed(() => toggleEditMode("joint")).parent("edit-mode").class("op-button").id("joint-button");

    erase_button = createButton("Erase points").mousePressed(() => toggleEditMode("erase")).parent("edit-mode").class("op-button").id("erase-button");

    point_anchor = createCheckbox("Anchor point?", false).parent("edit-mode").id("anchor-point");
    point_mass_label = createP("Mass: ").parent("edit-mode").id("mass-label");
    point_mass = createSlider(100, 2000, 1000, 100).parent("edit-mode").id("mass-slider")

    joint_isSpring = createCheckbox("Spring?", false).parent("edit-mode").id("joint spring");
    joint_springConstant_label = createP("Spring constant(µ): ").parent("edit-mode").id("spring-constant-label");
    joint_springConstant = createSlider(0, 5, 1, 1).parent("edit-mode").id("spring-constant")

    createButton("Clear all").mousePressed(clearAllPoints).class("op-button").parent("edit-mode").id("clear-all");

    toggle_show_single_particles = createButton("Show single particles: " + showSingleParticles).mousePressed(() => showSingleParticles = !showSingleParticles);
    toggle_show_single_particles.id("single-particles").parent("settings").class("op-button");
    background_alpha_label = createP("Background-alpha: ").parent("settings");
    background_alpha_slider = createSlider(0, 255, 255, 1).parent("settings").style("display: block");

    applyGForceButton = createButton("Apply gravity").mouseClicked(() => applyGForce = !applyGForce).class("op-button").parent("settings").id("gravity-toggler");
    applyDragButton = createButton("Apply drag").mouseClicked(() => applyDrag = !applyDrag).class("op-button").parent("settings").id("drag-toggler");
    dragCoeLabel = createP("Drag coefficient (rho): ").parent("settings");
    dragCoeSlider = createSlider(0.1, 2, 0.1, 0.1).parent("settings")
}


function draw() {
    //dev info
    FRAMERATE.html(Math.round(frameRate()));
    ind.html(editMode)

    //operators (updating html)
    toggleButton.html(editMode ? "Play" : "Edit");
    toggle_show_single_particles.html("Show single particles: " + showSingleParticles);
    point_mass_label.html("Mass: " + point_mass.value());
    joint_springConstant_label.html("Spring constant(µ): " + joint_springConstant.value());

    //settings
    if (editMode) background_alpha_slider.value(255);
    background_alpha_label.html("Background-alpha: " + background_alpha_slider.value());
    dragCoeLabel.html("Drag coefficient (rho): " + dragCoeSlider.value());
    DRAGCOE = dragCoeSlider.value();


    //showing or hiding buttons
    if (mouseMode == "point") {
        point_anchor.show();
        point_mass_label.show();
        point_mass.show();

        if (point_anchor.checked()) point_mass.value(1000);

    } else {
        point_anchor.hide();
        point_mass_label.hide();
        point_mass.hide();
    };

    //joint settings
    if (mouseMode == "joint") {
        joint_isSpring.show();
        if (joint_isSpring.checked()) {
            joint_springConstant_label.show();
            joint_springConstant.show();
        } else {
            joint_springConstant_label.hide();
            joint_springConstant.hide();
        }
    } else {
        joint_isSpring.hide();
        joint_springConstant_label.hide();
        joint_springConstant.hide();
    }

    //settings
    if (applyDrag) {
        dragCoeLabel.show();
        dragCoeSlider.show();
    } else {
        dragCoeLabel.hide();
        dragCoeSlider.hide();
    }


    //styling
    let addPointStyle = mouseMode == "point" ? "background-color: black;" : "background-color: grey;";
    let addJointStyle = mouseMode == "joint" ? "background-color: black;" : "background-color: grey;";
    let eraseButtonStyle = mouseMode == "erase" ? "background-color: black;" : "background-color: grey;";
    let gravityButtonStyle = applyGForce ? "background-color: black;" : "background-color: grey;";
    let dragButtonStyle = applyDrag ? "background-color: black;" : "background-color: grey;";

    addPoint.style(addPointStyle);
    addJoint.style(addJointStyle);
    erase_button.style(eraseButtonStyle);
    applyGForceButton.style(gravityButtonStyle);
    applyDragButton.style(dragButtonStyle);


    if (keyIsDown(SHIFT)) {
        mouseMode = "wind";
    } else if (mouseMode == "wind" || !editMode) {
        mouseMode = "scissors";
    }

    //FORCES

    FORCES[0] = WINDFORCE;



    if (!editMode) {
        for (let i = joints.length - 1; i >= 0; i--) {
            let joint = joints[i];
            if (joint.cut) {
                joints.splice(i, 1);
                continue;
            }
            joint.update();
        }
        for (let i = points.length - 1; i >= 0; i--) {
            let p = points[i];
            if (p == null) continue;
            if (applyGForce) {
                let gravitationalPull = G.copy().mult(p.mass).mult(FORCESCALECONSTANT);
                p.applyForce(gravitationalPull);
            }
            FORCES.forEach(f => p.applyForce(f));
            p.update(10);
            p.edgeCase();
        }


    }

    let background_grey = applyDrag ? map(DRAGCOE, 0.1, 2, 210, 140) : color("#FF6347");
    background(background_grey, background_alpha_slider.value());


    let currentJoints = editMode ? OGJOINTS : joints
    for (i = currentJoints.length - 1; i >= 0; i--) {
        let joint = currentJoints[i];
        if (joint.cut) {
            joints.splice(i, 1);
            continue;
        }
        joint.show();
    }

    let currentPoints = editMode ? OGPOINTS : points;
    for (let i = currentPoints.length - 1; i >= 0; i--) {
        let p = currentPoints[i];
        if (p == null) continue;
        if (p.num_of_joints <= 0 && !showSingleParticles) {
            continue;
        }
        p.showSelf();
    }

    mouseClickHandler();

    set_mouse_icon();

    if (keyIsDown(87)) {
        console.log(OGPOINTS);
        console.log(OGJOINTS);
    }
}

function generateWind() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        let dx = width / 2 - mouseX;
        let dy = height / 2 - mouseY;

        dx = map(dx, -width / 2, width / 2, -WINDSTRENGTH, WINDSTRENGTH);
        dy = map(dy, -height / 2, height / 2, -WINDSTRENGTH, WINDSTRENGTH);

        WINDFORCE.x = dx;
        WINDFORCE.y = dy;
    };
}

//set delay for adding points
let addPointInd = true;

let selectedPoint;

function mouseClickHandler() {
    //check if mouse is outside screen
    let mouseOutsideScreen = (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height);

    if (mouseMode == "wind") {
        generateWind();
        selectedPoint = undefined;

    } else if (mouseMode == "scissors") {
        WINDFORCE.x = 0
        WINDFORCE.y = 0
        if (mouseIsPressed) {
            joints.forEach(joint => {
                if (!joint.cut) joint.cutJoint(mouseX, mouseY);
            })
        }
        selectedPoint = undefined;
    } else if (mouseMode == "point") {
        if (!mouseIsPressed || !addPointInd || mouseOutsideScreen) return;

        addPointInd = false;
        createPoint(mouseX, mouseY, point_mass.value(), OGPOINTS.length, point_anchor.checked());
        setTimeout(() => addPointInd = true, 500);
        selectedPoint = undefined;
    } else if (mouseMode == "erase") {
        if (!mouseIsPressed || mouseOutsideScreen) return;

        let point_index;

        //find a point close to the mouse position when clicked
        let point_obj = OGPOINTS.find((p, index) => {
                if (p == null) return;
                let xdiff = Math.abs(mouseX - p.x);
                let ydiff = Math.abs(mouseY - p.y);
                if (xdiff < 6 && ydiff < 6) {
                    point_index = index;
                    return p;
                }
            })
            //cannot find such point
        if (!point_obj) return;

        //cut the point's joints first
        for (let j of point_obj.joints) {
            j.cutThisJoint();
        }
        //set it to null (CANNOT SPLICE IT CUZ IT WOULD AFFECT THE IDS!)
        OGPOINTS[point_index] = null;
        selectedPoint = undefined;
    } else if (mouseMode == "joint") {
        if (keyIsDown(69)) selectedPoint = undefined;

        if (mouseOutsideScreen || !editMode) return;

        if (selectedPoint) {

            if (joint_isSpring.checked()) {
                stroke(255);
                strokeWeight(joint_springConstant.value());
            } else {
                strokeWeight(2);
                stroke(0, 0, 255);
            }

            line(selectedPoint.x, selectedPoint.y, mouseX, mouseY);
        }


        let point_index;

        //find a point close to the mouse position when clicked
        let point_obj = OGPOINTS.find((p, index) => {
            if (p == null) return;
            let xdiff = Math.abs(mouseX - p.x);
            let ydiff = Math.abs(mouseY - p.y);
            if (xdiff < 6 && ydiff < 6) {
                point_index = index;
                return p;
            }
        });

        //set cursor to pointer when cursor is hovering over a point
        if (!point_obj) { canvas.style("cursor: default;"); return };
        canvas.style("cursor: pointer;");

        if (!mouseIsPressed) return;

        if (!selectedPoint) {
            selectedPoint = point_obj;
        } else if (selectedPoint.id != point_obj.id) {

            createLineJoint(point_obj, selectedPoint, joint_isSpring.checked(), joint_springConstant.value());
            selectedPoint = undefined;
            // console.log(OGJOINTS);
            // console.log(OGPOINTS);
        }

    };
}


function set_mouse_icon() {
    if (mouseMode == "scissors") {
        imageMode(CENTER);
        image(scissors_icon, mouseX, mouseY);
        canvas.style("cursor: none;")
    } else if (mouseMode == "wind") {
        imageMode(CENTER);
        image(wind_icon, mouseX, mouseY);
        canvas.style("cursor: none;")
    } else if (mouseMode == "point") {
        let c = point_anchor.checked() ? color(0, 255, 0) : 255;
        fill(c);
        stroke(255);
        let size = map(point_mass.value(), 100, 2000, 5, 25);
        ellipse(mouseX, mouseY, size);
        canvas.style("cursor: none;")
    } else if (mouseMode == "joint") {
        return;
    } else if (mouseMode == "erase") {

        imageMode(CENTER);
        image(eraser_icon, mouseX, mouseY);
        canvas.style("cursor: none;")
    }
}