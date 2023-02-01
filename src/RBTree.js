// Visual constants
const size_elements = 25;
const space_elements = 8;
const vertical_space_elements = 40;

// Range
const max_value = 127;
const min_vlaue = 0;

// MARK: Defining Enum

const Color = {
    red : 0,
    black : 1
}

// MARK: Defining Classes

class RBTree {
    headNode;
    height;
    startXPos;
    startYPos;

    constructor(headValue, startX, startY) {
        this.height = 0;
        this.startXPos = startX;
        this.startYPos = startY;
        this.headNode = this.createElement(headValue, null, true);
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
                    temp.right = this.createElement(value, temp, level, false);
                    temp.right.lineEl = this.connect(temp, temp.right);
                    if (level > this.height) {
                        ++this.height;
                        this.animateChanges();
                    }
                    this.rbInsertFixup(temp.right);
                    this.animateChanges();
                    break;
                }
            } else {
                if (temp.left != null) {
                    temp = temp.left;
                } else {
                    temp.left = this.createElement(value, temp, level, true);
                    temp.left.lineEl = this.connect(temp, temp.left);
                    if (level > this.height) {
                        ++this.height;
                        this.animateChanges();
                    }
                    this.rbInsertFixup(temp.left);
                    this.animateChanges();
                    break;
                }
            }
        }

    }

    createElement(value, parent, level, left) {
        let xpos = 0;
        let ypos = 0;
        let color = null;
        if (parent == null) {
            color = Color.black;
            xpos = this.startXPos;
            ypos = this.startYPos;
        } else {
            color = Color.red;
            let num = 2 ** (this.height - level);
            if (left) {
                xpos = parent.xpos - num * (space_elements + size_elements) / 2;
            } else {
                xpos = parent.xpos + num * (space_elements + size_elements) / 2;
            }
            ypos = parent.ypos + vertical_space_elements;
        }
        let element = document.createElement("div");

        element.style.width = size_elements + "px";
        element.style.height =  size_elements + "px";

        element.textContent = value;
        element.style.borderStyle = "solid";

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

        let newElement = new Element(value, element, color, parent, xpos, ypos);

        document.body.appendChild(newElement.element);

        return newElement;

    }

    rbInsertFixup(element) {
        if (element.parent == null) {
            element.makeBlack();
            return;
        }

        if (element.parent.color == Color.black) {
            return;
        }

        let parent = element.parent;
        let grandparent = element.getGrandparent();
        let uncle = element.getUncle();

        if (uncle != null && uncle.color == Color.red) {
            uncle.makeBlack();
            parent.makeBlack();
            grandparent.makeRed();
            this.rbInsertFixup(grandparent);
            return;
        }

        if (element == parent.right && parent == grandparent.left) {
            this.leftRotate(parent);
            element = parent;
            parent = element.parent;
        }

        else if (element == parent.left && parent == grandparent.right) {
            this.rightRotate(parent);
            element = parent;
            parent = element.parent;
        }

        parent.makeBlack();
        grandparent.makeRed();

        if (element == parent.left) {
            this.rightRotate(grandparent);
        }

        else {
            this.leftRotate(grandparent);
        }

    }

    leftRotate(element) {
        console.log("rotate left");
        let temp = element.right;
        element.right = temp.left;
        if (temp.left != null) {
            temp.left.parent = element;
        }
        temp.parent = element.parent;
        if (element.parent == null) {
            temp.deleteLine()
            this.headNode = temp;
        } else if (element.parent.left == element) {
            element.parent.left = temp
        } else {
            element.parent.right = temp;
        }
        temp.left = element;
        element.parent = temp;
        this.animateChanges();
    }

    rightRotate(element) {
        console.log("rotate right");
        let temp = element.left;
        element.left = temp.right;
        if (temp.right != null) {
            temp.right.parent = element;
        }
        temp.parent = element.parent;
        if (element.parent == null) {
            temp.deleteLine()
            this.headNode = temp;
        } else if (element.parent.right == element) {
            element.parent.right = temp
        } else {
            element.parent.left = temp;
        }
        temp.right = element;
        element.parent = temp;
        this.animateChanges();
    }

    animateChanges() {
        this.headNode.xpos = this.startXPos;
        this.headNode.ypos = this.startYPos;
        this.headNode.animate();
        if (this.headNode.left != null) {
            this.resizeTreeAlterElPos(this.headNode, 1, true);
        }
        if (this.headNode.right != null) {
            this.resizeTreeAlterElPos(this.headNode, 1, false);
        }
    }

    resizeTreeAlterElPos(element, level, left) {
        let num = 2 ** (this.height - level);
        let curEl = null;
        let xpos = 0;
        if (left) {
            curEl = element.left;
            xpos = element.xpos - num * (space_elements + size_elements) / 2;
        } else {
            curEl = element.right;
            xpos = element.xpos + num * (space_elements + size_elements) / 2;
        }
        let ypos = element.ypos + vertical_space_elements;
        this.changeElPos(curEl, xpos, ypos);
        if (curEl.left != null) {
            this.resizeTreeAlterElPos(curEl, level + 1, true);
        }
        if (curEl.right != null) {
            this.resizeTreeAlterElPos(curEl, level + 1, false);
        }
    }

    changeElPos(element, xpos, ypos) {
        element.xpos = xpos;
        element.ypos = ypos;
        let line = this.connect(element.parent, element);
        element.replaceLine(line);
        element.animate();
    }

    connect(startEl, endEl) { // draw a line connecting elements
        // bottom right
        let x1 = startEl.xpos + size_elements / 2;
        let y1 = startEl.ypos + size_elements + 1;
        // top right
        let x2 = endEl.xpos + size_elements / 2;
        let y2 = endEl.ypos + 1;
        // distance
        let length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
        // center
        let cx = ((x1 + x2) / 2) - (length / 2);
        let cy = ((y1 + y2) / 2) - (1 / 2);
        // angle
        let angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);
        // make hr
        let line = document.createElement("div");
        line.style.height = "1px";
        line.style.backgroundColor = "black";
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
    parent;
    lineEl;
    value;
    color;
    xpos;
    ypos;
    left;
    right;

    constructor(value, element, color, parent, xpos, ypos) {
        this.value = value;
        this.element = element;
        if (color == Color.red) {
            this.makeRed();
        }
        if (color == Color.black) {
            this.makeBlack();
        }
        this.parent = parent;
        this.xpos = xpos;
        this.ypos = ypos;
        this.left = null;
        this.right = null;
        this.lineEl = null;
    }

    makeRed() {
        this.color = Color.red;
        this.element.style.borderColor = "red";
    }

    makeBlack() {
        this.color = Color.black;
        this.element.style.borderColor = "black";
    }

    getGrandparent() {
        if (this.parent == null) {
            return null;
        }
        return this.parent.parent;
    }

    getUncle() {
        let grandparent = this.getGrandparent();
        if (grandparent == null) {
            return null;
        }
        if (grandparent.left == this.parent) {
            return grandparent.right;
        }
        return grandparent.left;
    }

    // animate to new position
    animate() {
        this.element.style.left = this.xpos;
        this.element.style.top = this.ypos;
    }

    deleteLine() {
        if (this.lineEl != null) {
            this.lineEl.remove();
        }
    }

    replaceLine(line) {
        this.deleteLine()
        this.lineEl = line;
    }
}