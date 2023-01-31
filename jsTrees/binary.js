// MARK: Setting Constants

// Visual constants
const top_margin = 50;
const left_margin = 20;
const size_elements = 25;
const space_elements = 8;
const vertical_space_elements = 40;
const speed = 400;

// Range
const max_value = 127;
const min_vlaue = 0;
const num_elements = 25; //n

// MARK: Defining Classes

class BinaryTree {
    headNode;
    height;

    constructor(headValue, startX, startY) {
        this.height = 0;
        this.headNode = this.createElement(headValue, startX, startY);
    }

    addNode(value) {
        let level = 0;
        let temp = this.headNode;
        while (temp != null) {
            ++level;
            if (value > temp.value) {
                if (temp.right != null) {
                    temp = temp.right;
                } else {
                    if (level > this.height) {
                        this.incHeight();
                    }
                    let num = 2 ** (this.height - level);
                     temp.right = this.createElement(value, temp.xpos + num * (space_elements + size_elements) / 2,temp.ypos + vertical_space_elements);
                    temp.right.lineEl = this.connect(temp, temp.right, "black", 1);
                    break;
                }
            } else {
                if (temp.left != null) {
                    temp = temp.left;
                } else {
                    let num = 2 ** (this.height - level);
                     temp.left = this.createElement(value, temp.xpos - num * (space_elements + size_elements) / 2,temp.ypos + vertical_space_elements);
                    temp.left.lineEl = this.connect(temp, temp.left, "black", 1);
                    if (level > this.height) {
                        this.incHeight();
                    }
                    break;
                }
            }
        }

    }

    createElement(value, xpos, ypos) {
        let element = document.createElement("div");

        element.style.width = size_elements + "px";
        element.style.height =  size_elements + "px";

        element.textContent = value;

        // Color element based on value
        let color_percent = Math.floor((value - min_vlaue) / (max_value - min_vlaue) * 255);
        let r_value = 50 + .8 * color_percent;
        let g_value = 250 - .9 * color_percent;
        let b_value = 125 + .5 * color_percent;
        element.style.backgroundColor = "rgba(" + r_value + ", " + g_value + ", " + b_value + ", 0.5)";

        element.style.transition = "all .25s ease-in-out"
        element.style.position = "absolute";

        element.style.left = xpos + "px";
        element.style.top = ypos + "px";

        let newElement = new Element(value, element, xpos, ypos);

        document.body.appendChild(newElement.element);

        return newElement;

    }

    incHeight() {
        ++this.height;
        if (this.headNode.left != null) {
            this.changeElPos(this.headNode, 1, true);
        }
        if (this.headNode.right != null) {
            this.changeElPos(this.headNode, 1, false);
        }
    }

    changeElPos(element, level, left) {
        let num = 2 ** (this.height - level);
        if (left) {
             element.left.xpos = element.xpos - num * (space_elements + size_elements) / 2;
            element.left.ypos = element.ypos + vertical_space_elements;
            let line = this.connect(element, element.left, "black", 1);
            element.left.replaceLine(line);
            element.left.animate();
            if (element.left.left != null) {
                this.changeElPos(element.left, level + 1, true);
            }
            if (element.left.right != null) {
                this.changeElPos(element.left, level + 1, false);
            }

        } else {
             element.right.xpos = element.xpos + num * (space_elements + size_elements) / 2;
            element.right.ypos = element.ypos + vertical_space_elements;
            let line = this.connect(element, element.right, "black", 1);
            element.right.replaceLine(line);
            element.right.animate();
            if (element.right.left != null) {
                this.changeElPos(element.right, level + 1, true);
            }
            if (element.right.right != null) {
                this.changeElPos(element.right, level + 1, false);
            }
        }

    }

    connect(startEl, endEl, color, thickness) { // draw a line connecting elements
        // bottom right
        let x1 = startEl.xpos + size_elements / 2;
        let y1 = startEl.ypos + size_elements;
        // top right
        let x2 = endEl.xpos + size_elements / 2;
        let y2 = endEl.ypos;
        // distance
        let length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
        // center
        let cx = ((x1 + x2) / 2) - (length / 2);
        let cy = ((y1 + y2) / 2) - (thickness / 2);
        // angle
        let angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);
        // make hr
        let line = document.createElement("div");
        line.style.height = thickness + "px";
        line.style.backgroundColor = color;
        line.style.lineHeight = "1px";
        line.style.position = "absolute";
        line.style.left = cx + "px";
        line.style.top = cy + "px";
        line.style.width = length + "px";
        line.style.transform = "rotate(" + angle + "deg)";
        document.body.appendChild(line);
        return line;
    }

}

// Element data for each DIV
class Element {
    element;
    lineEl;
    value
    xpos;
    ypos;
    left;
    right;

    constructor(value, element, xpos, ypos) {
        this.value = value;
        this.element = element;
        this.xpos = xpos;
        this.ypos = ypos;
        this.left = null;
        this.right = null;
    }

    // animate to new position
    animate() {
        this.element.style.left = this.xpos;
        this.element.style.top = this.ypos;
    }

    replaceLine(line) {
        this.lineEl.remove();
        this.lineEl = line;
    }
}

// MARK: Helper Functions

// Simple sleep function for given ms
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    // let binaryValues = [64, 32, 96, 16, 48, 80, 112, 8, 24, 40, 56, 72, 88, 104, 120, 4, 12, 20, 28, 36, 44, 52, 60, 68, 76, 84, 92, 100, 108, 116, 124, 2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 86, 90, 94, 98, 102, 106, 110, 114, 118, 122, 126, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51];

    // let firstValue = binaryValues[0];

    // let binary = new BinaryTree(firstValue, 1000, top_margin);

    // for (let i = 1; i < binaryValues.length; ++i) {
    //     await sleep(speed);
    //     let value = binaryValues[i];
    //     binary.addNode(value);
    // }

    let firstValue = Math.floor(Math.random() * (max_value - min_vlaue)) + min_vlaue;

    let binary = new BinaryTree(firstValue, 1000, top_margin);

    for (let i = 1; i < num_elements; ++i) {
        await sleep(speed);
        let value = Math.floor(Math.random() * (max_value - min_vlaue)) + min_vlaue;
        binary.addNode(value);
    }
}

// MARK: Main Program 

// run program
run();