// Results are rendered independently of the match timers. Names stay text-only.
const SVG_NS = "http://www.w3.org/2000/svg";
const COLORS = ["#FF4D4D", "#FFD447", "#66E3A4", "#B388FF"];
const DARK_COLORS = ["#B82828", "#C89D16", "#2C9F67", "#7849CC"];

function shape(parent, tag, attributes) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    parent.appendChild(node);
    return node;
}

function dancingFigure(playerId) {
    const index = ((Number(playerId) || 1) - 1 + COLORS.length) % COLORS.length;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 140 190");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.classList.add("celebration-figure");

    shape(svg, "ellipse", { cx: 70, cy: 177, rx: 35, ry: 8, fill: "#09070B", class: "celebration-shadow" });
    const rig = shape(svg, "g", { class: "celebration-rig" });
    const leftLeg = shape(rig, "g", { class: "celebration-leg celebration-leg--left" });
    shape(leftLeg, "path", { d: "M59 123L51 158L37 166", fill: "none", stroke: "#100D12", "stroke-width": 16, "stroke-linecap": "round", "stroke-linejoin": "round" });
    shape(leftLeg, "path", { d: "M59 123L51 157", fill: "none", stroke: DARK_COLORS[index], "stroke-width": 9, "stroke-linecap": "round" });
    const rightLeg = shape(rig, "g", { class: "celebration-leg celebration-leg--right" });
    shape(rightLeg, "path", { d: "M81 123L89 158L103 166", fill: "none", stroke: "#100D12", "stroke-width": 16, "stroke-linecap": "round", "stroke-linejoin": "round" });
    shape(rightLeg, "path", { d: "M81 123L89 157", fill: "none", stroke: DARK_COLORS[index], "stroke-width": 9, "stroke-linecap": "round" });

    const leftArm = shape(rig, "g", { class: "celebration-arm celebration-arm--left" });
    shape(leftArm, "path", { d: "M48 87L27 69L22 49", fill: "none", stroke: "#100D12", "stroke-width": 16, "stroke-linecap": "round", "stroke-linejoin": "round" });
    shape(leftArm, "path", { d: "M48 87L27 69L22 49", fill: "none", stroke: COLORS[index], "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round" });
    shape(leftArm, "circle", { cx: 22, cy: 47, r: 8, fill: COLORS[index], stroke: "#100D12", "stroke-width": 3 });
    const rightArm = shape(rig, "g", { class: "celebration-arm celebration-arm--right" });
    shape(rightArm, "path", { d: "M92 87L113 69L118 49", fill: "none", stroke: "#100D12", "stroke-width": 16, "stroke-linecap": "round", "stroke-linejoin": "round" });
    shape(rightArm, "path", { d: "M92 87L113 69L118 49", fill: "none", stroke: COLORS[index], "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round" });
    shape(rightArm, "circle", { cx: 118, cy: 47, r: 8, fill: COLORS[index], stroke: "#100D12", "stroke-width": 3 });

    shape(rig, "rect", { x: 45, y: 76, width: 50, height: 57, rx: 15, fill: DARK_COLORS[index], stroke: "#100D12", "stroke-width": 4 });
    shape(rig, "path", { d: "M57 91L70 101L83 91", fill: "none", stroke: COLORS[index], "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" });
    const head = shape(rig, "g", { class: "celebration-head" });
    shape(head, "rect", { x: 39, y: 24, width: 62, height: 57, rx: 16, fill: COLORS[index], stroke: "#100D12", "stroke-width": 4 });
    if (index === 1) {
        shape(head, "polygon", { points: "56,40 62,50 50,50", fill: "#100D12" });
        shape(head, "polygon", { points: "84,40 90,50 78,50", fill: "#100D12" });
        shape(head, "rect", { x: 58, y: 62, width: 24, height: 5, rx: 2, fill: "#100D12" });
    } else if (index === 3) {
        shape(head, "rect", { x: 49, y: 41, width: 14, height: 9, rx: 2, fill: "#100D12" });
        shape(head, "rect", { x: 77, y: 41, width: 14, height: 9, rx: 2, fill: "#100D12" });
        shape(head, "circle", { cx: 70, cy: 64, r: 6, fill: "#100D12" });
    } else {
        shape(head, "circle", { cx: 56, cy: 46, r: 5, fill: "#100D12" });
        shape(head, "circle", { cx: 84, cy: 46, r: 5, fill: "#100D12" });
        shape(head, "path", { d: index === 2 ? "M55 65L62 60L70 65L78 60L85 65" : "M56 61Q70 76 84 61", fill: "none", stroke: "#100D12", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round" });
    }
    shape(head, "path", { d: "M54 23L48 8L64 13L70 3L77 13L93 8L87 23Z", fill: "#FFD447", stroke: "#100D12", "stroke-width": 3, "stroke-linejoin": "round" });
    return svg;
}

export function renderCelebration(container, winners) {
    if (!container) return;
    container.replaceChildren();
    container.classList.add("celebration-stage");
    container.removeAttribute("aria-hidden");
    container.setAttribute("role", "group");
    const champions = Array.isArray(winners) ? winners.filter(Boolean) : [];
    const names = champions.map((player) => String(player.name || `Player ${player.id}`));
    container.setAttribute("aria-label", `${champions.length > 1 ? "Shared champions" : "Champion"}: ${names.join(", ")}`);
    container.dataset.winnerCount = String(champions.length);

    const headline = document.createElement("div");
    headline.className = "celebration-stage__headline";
    headline.textContent = champions.length > 1 ? "🏆 SHARED VICTORY. EVERYONE DANCES!" : "🏆 YOUR VICTORY LAP!";
    container.appendChild(headline);
    const lineup = document.createElement("div");
    lineup.className = "celebration-lineup";
    lineup.setAttribute("role", "list");
    champions.forEach((player, index) => {
        const dancer = document.createElement("figure");
        dancer.className = "celebration-dancer";
        dancer.dataset.playerId = String(player.id);
        dancer.style.setProperty("--dance-delay", `${index * -0.18}s`);
        dancer.setAttribute("role", "listitem");
        dancer.appendChild(dancingFigure(player.id));
        const caption = document.createElement("figcaption");
        caption.className = "celebration-name";
        caption.textContent = names[index];
        dancer.appendChild(caption);
        lineup.appendChild(dancer);
    });
    container.appendChild(lineup);
}
