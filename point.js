class Point {
    constructor(x, y, mass, coord, anchored = false) {
        this.x = x;
        this.y = y;

        this.old_x = x;
        this.old_y = y;

        this.acc_x = 0;
        this.acc_y = 0;

        this.mass = mass;
        // this.size = mass / 100;
        this.size = (mass - 100) * (25 - 5) / (2000 - 100) + 5;

        this.num_of_joints = 0;
        this.joints = [];
        this.connectedPoints = [];
        this.forceApplied = [];

        //coordinates of the point
        this.id = coord;

        this.anchored = anchored;
    }

    applyForce(force) {
        this.acc_x += force.x / this.mass;
        this.acc_y += force.y / this.mass;


    }

    update(dt) {
        if (this.anchored) return;

        //tension force on connected points
        for (let connectP of this.connectedPoints) {
            if (this.forceApplied.includes(connectP.id)) continue;

            // let this_angle_Pvector = createVector(this.x - connectP.x, this.y - connectP.y);
            // let this_angle = Math.atan(this_angle_Pvector.y / this_angle_Pvector.x);
            // console.log(degrees(this_angle));
            let Tforce = createVector(this.acc_x, this.acc_y);
            Tforce.mult(this.mass / 5);

            // this.forceApplied.push(connectP.id);
            connectP.applyForce(Tforce);
        }




        //verlet integration using old x and y positions
        let vel_x = this.x - this.old_x;
        let vel_y = this.y - this.old_y;


        let velSq_mag = (vel_x ** 2 + vel_y ** 2);

        //drag force
        if (applyDrag) {
            let drag = createVector(vel_x, vel_y).normalize().mult(-1);
            drag.setMag(velSq_mag * DRAGCOE);
            // console.log(drag);
            this.applyForce(drag);
        }

        this.old_x = this.x;
        this.old_y = this.y;

        this.x += vel_x + this.acc_x * dt;
        this.y += vel_y + this.acc_y * dt;

        this.acc_x = 0;
        this.acc_y = 0;

    }

    edgeCase() {
        if (this.x < 0) {
            let x_vel = this.x - this.old_x;

            this.x = 0;
            this.old_x = this.x + x_vel;
        } else if (this.x > width) {
            let x_vel = this.x - this.old_x;

            this.x = width;
            this.old_x = this.x + x_vel;
        }
        if (this.y < 0) {
            let y_vel = this.y - this.old_y;

            this.y = 0;
            this.old_y = this.y + y_vel;
        } else if (this.y > height) {
            let y_vel = this.y - this.old_y;

            this.y = height;
            this.old_y = this.y + y_vel;
        }
    }

    showSelf() {
        if (selectedPoint && selectedPoint.id == this.id && editMode) {
            fill(255, 255, 0);
        } else fill(255);
        strokeWeight(2);
        if (this.anchored) fill(0, 255, 0);
        stroke(255);
        ellipse(this.x, this.y, this.size);
    }

    clone() {
        return new Point(this.x, this.y, this.mass, this.anchored);
    }
}