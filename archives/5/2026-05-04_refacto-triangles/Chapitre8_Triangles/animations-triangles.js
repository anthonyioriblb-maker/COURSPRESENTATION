// ============================================================
//  Animations SVG interactives – Chapitre 8 Les triangles
//  Extraites fidèlement du cours pour préserver la cohérence
//  des coordonnées avec les SVG de la présentation.
// ============================================================

(function() {
            // Points clés (px, échelle 55px/cm)
            const A = {x:90,  y:320};
            const B = {x:420, y:320};
            const C = {x:277, y:118}; // BC≈247.5px, AC≈275px
            let stepTri = 0;
            let animating = false;

            const steps = [
                'Cliquez sur « Étape suivante » pour voir la construction.',
                'Étape 1 – On trace le segment [AB] de longueur 6 cm à la règle.',
                'Étape 2 – On ouvre le compas à l\'écartement BC = 4,5 cm. On pose la pointe en B et on trace un arc de cercle.',
                'Étape 3 – On ouvre le compas à l\'écartement AC = 5 cm. On pose la pointe en A et on trace un arc de cercle.',
                'Étape 4 – Le point C est à l\'intersection des deux arcs. On trace les côtés [BC] et [AC] pour compléter le triangle.'
            ];

            function sleep(ms) { return new Promise(r => setTimeout(r,ms)); }

            /* ── Construction de la règle ── */
            function buildRuler(gId, x0, yBottom, nCm, pxPerCm) {
                const g = document.getElementById(gId);
                const NS = 'http://www.w3.org/2000/svg';
                const h = 38, yTop = yBottom - h;
                const totalW = nCm * pxPerCm + 24;
                const xStart = x0 - 8;
                // Corps
                const rect = document.createElementNS(NS,'rect');
                rect.setAttribute('x', xStart); rect.setAttribute('y', yTop);
                rect.setAttribute('width', totalW); rect.setAttribute('height', h);
                rect.setAttribute('rx','3');
                rect.setAttribute('fill','rgba(215,235,255,0.93)');
                rect.setAttribute('stroke','#4488bb'); rect.setAttribute('stroke-width','1.8');
                g.appendChild(rect);
                // Bord inférieur épais (bord traceur)
                const edge = document.createElementNS(NS,'line');
                edge.setAttribute('x1', xStart); edge.setAttribute('y1', yBottom);
                edge.setAttribute('x2', (xStart+totalW).toString()); edge.setAttribute('y2', yBottom);
                edge.setAttribute('stroke','#2266aa'); edge.setAttribute('stroke-width','2.5');
                g.appendChild(edge);
                // Reflet
                const shine = document.createElementNS(NS,'line');
                shine.setAttribute('x1',(xStart+4).toString()); shine.setAttribute('y1',(yTop+4).toString());
                shine.setAttribute('x2',(xStart+totalW-4).toString()); shine.setAttribute('y2',(yTop+4).toString());
                shine.setAttribute('stroke','rgba(255,255,255,0.65)'); shine.setAttribute('stroke-width','3');
                shine.setAttribute('stroke-linecap','round');
                g.appendChild(shine);
                // Graduations
                const totalMm = nCm * 10;
                for (let mm = 0; mm <= totalMm; mm++) {
                    const x = x0 + mm * pxPerCm / 10;
                    let tickH, sw, col;
                    if (mm % 10 === 0)     { tickH=20; sw=1.6; col='#223'; }
                    else if (mm % 5 === 0) { tickH=14; sw=1.2; col='#446'; }
                    else                   { tickH=7;  sw=0.8; col='#779'; }
                    const ln = document.createElementNS(NS,'line');
                    ln.setAttribute('x1', x.toFixed(1)); ln.setAttribute('y1', (yBottom-tickH).toString());
                    ln.setAttribute('x2', x.toFixed(1)); ln.setAttribute('y2', yBottom.toString());
                    ln.setAttribute('stroke',col); ln.setAttribute('stroke-width', sw.toString());
                    g.appendChild(ln);
                    if (mm % 10 === 0 && mm > 0) {
                        const tx = document.createElementNS(NS,'text');
                        tx.setAttribute('x', x.toFixed(1)); tx.setAttribute('y', (yTop+16).toString());
                        tx.setAttribute('text-anchor','middle');
                        tx.setAttribute('font-size','13'); tx.setAttribute('font-weight','bold');
                        tx.setAttribute('fill','#223');
                        tx.textContent = String(mm/10);
                        g.appendChild(tx);
                    }
                }
            }

            async function slideRuler(gId, dyFrom, dyTo, dur) {
                const g = document.getElementById(gId);
                g.style.opacity = '1';
                const N = 28;
                for (let i = 0; i <= N; i++) {
                    const dy = dyFrom + (dyTo - dyFrom) * i / N;
                    g.setAttribute('transform', `translate(0,${dy.toFixed(1)})`);
                    await sleep(dur / N);
                }
                if (dyTo < 0) g.style.opacity = '0';
            }

            // Initialisation de la règle : A=(90,320), 6cm à 55px/cm
            buildRuler('rul1', 90, 320, 6, 55);

            function setCompassPos(pt, pencilEnd) {
                const hx = (pt.x + pencilEnd.x)/2;
                const hy = (pt.y + pencilEnd.y)/2;
                document.getElementById('cHinge').setAttribute('cx', hx);
                document.getElementById('cHinge').setAttribute('cy', hy);
                const pb = document.getElementById('cPointBranch');
                pb.setAttribute('x1', hx); pb.setAttribute('y1', hy);
                pb.setAttribute('x2', pt.x); pb.setAttribute('y2', pt.y);
                document.getElementById('cPointTip').setAttribute('cx', pt.x);
                document.getElementById('cPointTip').setAttribute('cy', pt.y);
                const pen = document.getElementById('cPencilBranch');
                pen.setAttribute('x1', hx); pen.setAttribute('y1', hy);
                pen.setAttribute('x2', pencilEnd.x); pen.setAttribute('y2', pencilEnd.y);
                const ang = Math.atan2(pencilEnd.y - hy, pencilEnd.x - hx);
                document.getElementById('cPencilBody').setAttribute('transform',
                    `translate(${pencilEnd.x},${pencilEnd.y-13}) rotate(${ang*180/Math.PI+90})`);
                document.getElementById('cPencilTip').setAttribute('transform',
                    `translate(${pencilEnd.x-5},${pencilEnd.y}) rotate(${ang*180/Math.PI+90} 5 0)`);
                document.getElementById('cPencilPoint').setAttribute('cx', pencilEnd.x);
                document.getElementById('cPencilPoint').setAttribute('cy', pencilEnd.y);
            }

            async function animOpen(center, target, dur) {
                const s=30;
                for(let i=0;i<=s;i++){
                    const t=i/s;
                    setCompassPos(center,{x:center.x+(target.x-center.x)*t, y:center.y+(target.y-center.y)*t});
                    await sleep(dur/s);
                }
            }

            async function animMove(fp,fe,tp,te,dur) {
                const s=40;
                for(let i=0;i<=s;i++){
                    const t=i/s;
                    setCompassPos(
                        {x:fp.x+(tp.x-fp.x)*t, y:fp.y+(tp.y-fp.y)*t},
                        {x:fe.x+(te.x-fe.x)*t, y:fe.y+(te.y-fe.y)*t}
                    );
                    await sleep(dur/s);
                }
            }

            function drawArcPath(id, cx, cy, r, a0, a1, steps) {
                let d='';
                for(let i=0;i<=steps;i++){
                    const a=a0+(a1-a0)*i/steps;
                    const x=cx+r*Math.cos(a);
                    const y=cy+r*Math.sin(a);
                    d += (i===0?'M ':'L ')+x.toFixed(1)+' '+y.toFixed(1)+' ';
                }
                const el=document.getElementById(id);
                el.setAttribute('d',d);
                el.style.opacity='1';
            }

            window.nextStepTri = async function() {
                if (animating) return;
                animating = true;
                const btn = document.getElementById('btnNextTri');
                btn.disabled = true;
                const compass = document.getElementById('compassTri');

                if (stepTri === 0) {
                    // Étape 1 : règle glisse → trace [AB] → règle repart
                    document.getElementById('stepTextTri').textContent = steps[1];
                    await slideRuler('rul1', -200, 0, 500);
                    await sleep(200);
                    const grp = document.getElementById('groupAB_tri');
                    grp.style.opacity = '1';
                    const seg = document.getElementById('segAB_tri');
                    const N = 40;
                    for(let i=0; i<=N; i++){
                        seg.setAttribute('x2', (A.x + (B.x-A.x)*i/N).toFixed(1));
                        await sleep(700/N);
                    }
                    await sleep(300);
                    await slideRuler('rul1', 0, -200, 400);
                    stepTri=1;

                } else if (stepTri === 1) {
                    document.getElementById('stepTextTri').textContent = steps[2];
                    compass.style.opacity = '1';
                    setCompassPos(B, B);
                    await sleep(400);
                    await animOpen(B, C, 1400);
                    await sleep(400);
                    const aC = Math.atan2(C.y-B.y, C.x-B.x);
                    drawArcPath('arcB_tri', B.x, B.y, 247.5, aC-0.45, aC+0.45, 60);
                    document.getElementById('labelBC').style.opacity='1';
                    await sleep(800);
                    stepTri=2;

                } else if (stepTri === 2) {
                    document.getElementById('stepTextTri').textContent = steps[3];
                    const pencilBC = {x: B.x + 247.5*Math.cos(Math.atan2(C.y-B.y,C.x-B.x)),
                                      y: B.y + 247.5*Math.sin(Math.atan2(C.y-B.y,C.x-B.x))};
                    const pencilAC = {x: A.x + 275*Math.cos(Math.atan2(C.y-A.y,C.x-A.x)),
                                      y: A.y + 275*Math.sin(Math.atan2(C.y-A.y,C.x-A.x))};
                    await animMove(B, pencilBC, A, A, 1000);
                    await sleep(300);
                    await animOpen(A, pencilAC, 1200);
                    await sleep(400);
                    const aCA = Math.atan2(C.y-A.y, C.x-A.x);
                    drawArcPath('arcA_tri', A.x, A.y, 275, aCA-0.45, aCA+0.45, 60);
                    document.getElementById('labelAC').style.opacity='1';
                    await sleep(800);
                    stepTri=3;

                } else if (stepTri === 3) {
                    document.getElementById('stepTextTri').textContent = steps[4];
                    compass.style.opacity = '0';
                    await sleep(400);
                    document.getElementById('pointC_tri').style.opacity='1';
                    await sleep(600);
                    document.getElementById('sideBC').style.opacity='1';
                    document.getElementById('sideAC').style.opacity='1';
                    btn.textContent = '— Fin —';
                    btn.style.backgroundColor='#888';
                    stepTri=4;
                }
                animating = false;
                if (stepTri < 4) btn.disabled = false;
            };

            window.resetTri = function() {
                stepTri=0; animating=false;
                document.getElementById('stepTextTri').textContent = steps[0];
                document.getElementById('compassTri').style.opacity='0';
                document.getElementById('groupAB_tri').style.opacity='0';
                document.getElementById('segAB_tri').setAttribute('x2', A.x.toString());
                document.getElementById('rul1').setAttribute('transform','translate(0,-200)');
                document.getElementById('rul1').style.opacity='0';
                ['arcB_tri','arcA_tri'].forEach(id=>{
                    const el=document.getElementById(id);
                    el.setAttribute('d',''); el.style.opacity='0';
                });
                document.getElementById('pointC_tri').style.opacity='0';
                document.getElementById('sideBC').style.opacity='0';
                document.getElementById('sideAC').style.opacity='0';
                document.getElementById('labelBC').style.opacity='0';
                document.getElementById('labelAC').style.opacity='0';
                const btn=document.getElementById('btnNextTri');
                btn.disabled=false;
                btn.textContent='Étape suivante ▶';
                btn.style.backgroundColor='#3498db';
            };
        })();

/* ════════════════════════════════════════════════════════════ */

/* ── CAS 2 : angle + 2 côtés adjacents ───────────────────────── */
        (function(){
            // Coordonnées clés (échelle 50px/cm)
            // A=(100,300) B=(350,300)  C=(229,147) — angle A=50°, AB=5cm, AC=4cm
            const A={x:100,y:300}, B={x:350,y:300};
            const R_RAP = 82; // rayon du rapporteur en px
            const TARGET_DEG = 50;
            let step=0, anim=false;

            const texts=[
                'Cliquez sur « Étape suivante » pour voir la construction.',
                'Étape 1 – On trace le segment [AB] de longueur 5 cm à la règle.',
                'Étape 2 – On place le rapporteur en A (centre sur A, 0° vers B) et on repère 50°.',
                'Étape 3 – On trace la demi-droite [AC) depuis A dans la direction marquée.',
                'Étape 4 – On règle le compas sur 4 cm. Pointe sèche en A, on trace un arc de cercle.',
                'Étape 5 – C est le point de [AC) à 4 cm de A. On trace [BC] pour compléter le triangle.'
            ];

            function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
            function show(id){document.getElementById(id).style.opacity='1';}
            function hide(id){document.getElementById(id).style.opacity='0';}

            /* ── Règle animée ── */
            function buildRuler(gId, x0, yBottom, nCm, pxPerCm) {
                const g=document.getElementById(gId), NS='http://www.w3.org/2000/svg';
                const h=38, yTop=yBottom-h, totalW=nCm*pxPerCm+24, xStart=x0-8;
                const rect=document.createElementNS(NS,'rect');
                rect.setAttribute('x',xStart); rect.setAttribute('y',yTop);
                rect.setAttribute('width',totalW); rect.setAttribute('height',h);
                rect.setAttribute('rx','3'); rect.setAttribute('fill','rgba(215,235,255,0.93)');
                rect.setAttribute('stroke','#4488bb'); rect.setAttribute('stroke-width','1.8');
                g.appendChild(rect);
                const edge=document.createElementNS(NS,'line');
                edge.setAttribute('x1',xStart); edge.setAttribute('y1',yBottom);
                edge.setAttribute('x2',(xStart+totalW).toString()); edge.setAttribute('y2',yBottom);
                edge.setAttribute('stroke','#2266aa'); edge.setAttribute('stroke-width','2.5');
                g.appendChild(edge);
                const shine=document.createElementNS(NS,'line');
                shine.setAttribute('x1',(xStart+4).toString()); shine.setAttribute('y1',(yTop+4).toString());
                shine.setAttribute('x2',(xStart+totalW-4).toString()); shine.setAttribute('y2',(yTop+4).toString());
                shine.setAttribute('stroke','rgba(255,255,255,0.65)'); shine.setAttribute('stroke-width','3');
                shine.setAttribute('stroke-linecap','round'); g.appendChild(shine);
                for(let mm=0;mm<=nCm*10;mm++){
                    const x=x0+mm*pxPerCm/10;
                    let tH,sw,col;
                    if(mm%10===0){tH=20;sw=1.6;col='#223';}
                    else if(mm%5===0){tH=14;sw=1.2;col='#446';}
                    else{tH=7;sw=0.8;col='#779';}
                    const ln=document.createElementNS(NS,'line');
                    ln.setAttribute('x1',x.toFixed(1)); ln.setAttribute('y1',(yBottom-tH).toString());
                    ln.setAttribute('x2',x.toFixed(1)); ln.setAttribute('y2',yBottom.toString());
                    ln.setAttribute('stroke',col); ln.setAttribute('stroke-width',sw.toString());
                    g.appendChild(ln);
                    if(mm%10===0&&mm>0){
                        const tx=document.createElementNS(NS,'text');
                        tx.setAttribute('x',x.toFixed(1)); tx.setAttribute('y',(yTop+16).toString());
                        tx.setAttribute('text-anchor','middle'); tx.setAttribute('font-size','13');
                        tx.setAttribute('font-weight','bold'); tx.setAttribute('fill','#223');
                        tx.textContent=String(mm/10); g.appendChild(tx);
                    }
                }
            }

            async function slideRuler(gId, dyFrom, dyTo, dur) {
                const g=document.getElementById(gId); g.style.opacity='1';
                const N=28;
                for(let i=0;i<=N;i++){
                    const dy=dyFrom+(dyTo-dyFrom)*i/N;
                    g.setAttribute('transform',`translate(0,${dy.toFixed(1)})`);
                    await sleep(dur/N);
                }
                if(dyTo<0) g.style.opacity='0';
            }

            buildRuler('rul2', 100, 300, 5, 50);

            /* ── Construction JS du rapporteur ── */
            function buildRap(gId, R, target, showLabels){
                const g=document.getElementById(gId);
                const NS='http://www.w3.org/2000/svg';
                // Fond semi-circulaire
                const bg=document.createElementNS(NS,'path');
                bg.setAttribute('d',`M ${R} 0 A ${R} ${R} 0 0 0 ${-R} 0 Z`);
                bg.setAttribute('fill','rgba(255,252,200,0.90)');
                bg.setAttribute('stroke','#999');
                bg.setAttribute('stroke-width','1.5');
                g.appendChild(bg);
                // Graduations
                for(let d=0;d<=180;d+=10){
                    const r=d*Math.PI/180;
                    const maj=d%30===0;
                    const inner=R-(maj?16:8);
                    const mk=document.createElementNS(NS,'line');
                    mk.setAttribute('x1',(R*Math.cos(r)).toFixed(1));
                    mk.setAttribute('y1',(-R*Math.sin(r)).toFixed(1));
                    mk.setAttribute('x2',(inner*Math.cos(r)).toFixed(1));
                    mk.setAttribute('y2',(-inner*Math.sin(r)).toFixed(1));
                    mk.setAttribute('stroke', d===target?'#c0392b':'#666');
                    mk.setAttribute('stroke-width', d===target?'2.8':(maj?'2':'1.2'));
                    g.appendChild(mk);
                    if(maj && showLabels){
                        const tx=document.createElementNS(NS,'text');
                        tx.setAttribute('x',((R+13)*Math.cos(r)).toFixed(1));
                        tx.setAttribute('y',(-(R+13)*Math.sin(r)+4).toFixed(1));
                        tx.setAttribute('text-anchor','middle');
                        tx.setAttribute('font-size','11');
                        tx.setAttribute('fill','#555');
                        tx.textContent=String(d);
                        g.appendChild(tx);
                    }
                }
                // Ligne de base
                const bl=document.createElementNS(NS,'line');
                bl.setAttribute('x1',(-R-5).toString()); bl.setAttribute('y1','0');
                bl.setAttribute('x2',(R+5).toString());  bl.setAttribute('y2','0');
                bl.setAttribute('stroke','#888'); bl.setAttribute('stroke-width','1.5');
                g.appendChild(bl);
                // Centre
                const dot=document.createElementNS(NS,'circle');
                dot.setAttribute('cx','0'); dot.setAttribute('cy','0');
                dot.setAttribute('r','3'); dot.setAttribute('fill','#333');
                g.appendChild(dot);
                // Ligne indicatrice (animée)
                const ind=document.createElementNS(NS,'line');
                ind.setAttribute('id',gId+'_ind');
                ind.setAttribute('x1','0'); ind.setAttribute('y1','0');
                ind.setAttribute('x2',(R*0.88).toFixed(1)); ind.setAttribute('y2','0');
                ind.setAttribute('stroke','#e74c3c'); ind.setAttribute('stroke-width','2.8');
                ind.setAttribute('opacity','0');
                g.appendChild(ind);
            }

            /* ── Balayage de la ligne indicatrice de 0° → targetDeg ── */
            async function sweep(gId, R, targetDeg, dur){
                const ind=document.getElementById(gId+'_ind');
                ind.setAttribute('opacity','1');
                const N=45;
                for(let i=0;i<=N;i++){
                    const r=(targetDeg*i/N)*Math.PI/180;
                    ind.setAttribute('x2',(R*0.88*Math.cos(r)).toFixed(1));
                    ind.setAttribute('y2',(-R*0.88*Math.sin(r)).toFixed(1));
                    await sleep(dur/N);
                }
            }

            /* ── Compas ── */
            function setComp2(dry,pen){
                const hx=(dry.x+pen.x)/2, hy=(dry.y+pen.y)/2;
                document.getElementById('c2h').setAttribute('cx',hx);
                document.getElementById('c2h').setAttribute('cy',hy);
                const pb=document.getElementById('c2pb');
                pb.setAttribute('x1',hx); pb.setAttribute('y1',hy);
                pb.setAttribute('x2',dry.x); pb.setAttribute('y2',dry.y);
                document.getElementById('c2pt').setAttribute('cx',dry.x);
                document.getElementById('c2pt').setAttribute('cy',dry.y);
                const nb=document.getElementById('c2nb');
                nb.setAttribute('x1',hx); nb.setAttribute('y1',hy);
                nb.setAttribute('x2',pen.x); nb.setAttribute('y2',pen.y);
                const ang=Math.atan2(pen.y-hy, pen.x-hx);
                const deg=ang*180/Math.PI;
                document.getElementById('c2bd').setAttribute('transform',
                    `translate(${pen.x},${pen.y-9}) rotate(${deg+90})`);
                document.getElementById('c2tp').setAttribute('transform',
                    `translate(${pen.x-4},${pen.y}) rotate(${deg+90} 4 0)`);
                document.getElementById('c2pp').setAttribute('cx',pen.x);
                document.getElementById('c2pp').setAttribute('cy',pen.y);
            }

            /* ── Dessin progressif de l'arc ── */
            async function drawArc2(pathId,cx,cy,r,degStart,degEnd,dur){
                // Angles en degrés MATHÉMATIQUES (positif = trigonométrique = vers le haut en SVG)
                // Conversion SVG : y_svg = cy + r*sin(-deg_math) = cy - r*sin(deg_math)
                const a0=-degStart*Math.PI/180;
                const a1=-degEnd*Math.PI/180;
                const el=document.getElementById(pathId);
                el.style.opacity='1';
                const N=50;
                let d='';
                for(let i=0;i<=N;i++){
                    const a=a0+(a1-a0)*i/N;
                    const x=(cx+r*Math.cos(a)).toFixed(1);
                    const y=(cy+r*Math.sin(a)).toFixed(1);
                    d+=(i===0?'M ':'L ')+x+' '+y+' ';
                    el.setAttribute('d',d);
                    // Mettre à jour la pointe crayon du compas
                    if(i>0) setComp2(A,{x:cx+r*Math.cos(a), y:cy+r*Math.sin(a)});
                    if(i<N) await sleep(dur/N);
                }
            }

            // Initialisation
            buildRap('rap2', R_RAP, TARGET_DEG, true);

            window.next2 = async function(){
                if(anim || step>=5) return;
                const btn=document.getElementById('btn2');
                btn.disabled=true;
                anim=true; step++;
                document.getElementById('st2').textContent=texts[step];

                if(step===1){
                    // Règle glisse → trace [AB] → règle repart
                    await slideRuler('rul2', -150, 0, 480);
                    await sleep(200);
                    show('labsAB2');
                    const seg=document.getElementById('segAB2');
                    seg.style.opacity='1';
                    const N=40;
                    for(let i=0;i<=N;i++){
                        seg.setAttribute('x2',(100+(350-100)*i/N).toFixed(1));
                        await sleep(700/N);
                    }
                    await sleep(300);
                    await slideRuler('rul2', 0, -150, 380);

                }else if(step===2){
                    // Rapporteur en A
                    show('rap2');
                    await sleep(500);
                    await sweep('rap2', R_RAP, TARGET_DEG, 1200);
                    await sleep(600);
                    show('amk2'); show('atx2');
                    await sleep(800);
                    hide('rap2');

                }else if(step===3){
                    // Demi-droite [AC)
                    show('ray2');

                }else if(step===4){
                    // Compas : pointe en A, trace un arc (35°→65°)
                    const degS=35, degE=65; // degrés mathématiques
                    const aS=-degS*Math.PI/180;
                    const penStart={
                        x: A.x+200*Math.cos(aS),
                        y: A.y+200*Math.sin(aS)
                    };
                    setComp2(A, penStart);
                    show('cmp2');
                    await sleep(500);
                    await drawArc2('arcAC2', A.x, A.y, 200, degS, degE, 1400);
                    show('labAC2');
                    await sleep(800);
                    hide('cmp2');

                }else if(step===5){
                    // Point C + côtés
                    show('ptC2');
                    await sleep(400);
                    hide('ray2');
                    show('sdAC2'); show('sdBC2');
                    const btn2=document.getElementById('btn2');
                    btn2.textContent='— Fin —';
                    btn2.style.backgroundColor='#888';
                }

                anim=false;
                if(step<5) btn.disabled=false;
            };

            window.reset2 = function(){
                step=0; anim=false;
                document.getElementById('st2').textContent=texts[0];
                ['segAB2','labsAB2','rap2','amk2','atx2',
                 'ray2','cmp2','arcAC2','labAC2','ptC2','sdBC2','sdAC2'].forEach(hide);
                document.getElementById('segAB2').setAttribute('x2','100');
                document.getElementById('rul2').setAttribute('transform','translate(0,-150)');
                document.getElementById('rul2').style.opacity='0';
                document.getElementById('arcAC2').setAttribute('d','');
                const ind=document.getElementById('rap2_ind');
                if(ind){ind.setAttribute('x2',(R_RAP*0.88).toFixed(1)); ind.setAttribute('y2','0');}
                const btn=document.getElementById('btn2');
                btn.disabled=false; btn.textContent='Étape suivante ▶';
                btn.style.backgroundColor='#3498db';
            };
        })();

/* ════════════════════════════════════════════════════════════ */

/* ── CAS 3 : deux angles + côté compris ──────────────────────── */
        (function(){
            // B=(100,300) C=(350,300) A=(280,149) — angle B=40°, angle C=65°, BC=5cm
            const R_RAP=82;
            let step=0, anim=false;

            const texts=[
                'Cliquez sur « Étape suivante » pour voir la construction.',
                'Étape 1 – On trace le segment [BC] de longueur 5 cm à la règle.',
                'Étape 2 – Rapporteur en B (0° vers C) : on repère et marque 40°.',
                'Étape 3 – On trace la demi-droite [BA) depuis B dans la direction 40°.',
                'Étape 4 – Rapporteur en C (0° vers B) : on repère et marque 65°.',
                'Étape 5 – On trace la demi-droite [CA) depuis C dans la direction 65°.',
                'Étape 6 – A est l\'intersection des deux demi-droites. On trace [AB] et [AC].'
            ];

            function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
            function show(id){document.getElementById(id).style.opacity='1';}
            function hide(id){document.getElementById(id).style.opacity='0';}

            /* ── Règle animée ── */
            function buildRuler(gId, x0, yBottom, nCm, pxPerCm) {
                const g=document.getElementById(gId), NS='http://www.w3.org/2000/svg';
                const h=38, yTop=yBottom-h, totalW=nCm*pxPerCm+24, xStart=x0-8;
                const rect=document.createElementNS(NS,'rect');
                rect.setAttribute('x',xStart); rect.setAttribute('y',yTop);
                rect.setAttribute('width',totalW); rect.setAttribute('height',h);
                rect.setAttribute('rx','3'); rect.setAttribute('fill','rgba(215,235,255,0.93)');
                rect.setAttribute('stroke','#4488bb'); rect.setAttribute('stroke-width','1.8');
                g.appendChild(rect);
                const edge=document.createElementNS(NS,'line');
                edge.setAttribute('x1',xStart); edge.setAttribute('y1',yBottom);
                edge.setAttribute('x2',(xStart+totalW).toString()); edge.setAttribute('y2',yBottom);
                edge.setAttribute('stroke','#2266aa'); edge.setAttribute('stroke-width','2.5');
                g.appendChild(edge);
                const shine=document.createElementNS(NS,'line');
                shine.setAttribute('x1',(xStart+4).toString()); shine.setAttribute('y1',(yTop+4).toString());
                shine.setAttribute('x2',(xStart+totalW-4).toString()); shine.setAttribute('y2',(yTop+4).toString());
                shine.setAttribute('stroke','rgba(255,255,255,0.65)'); shine.setAttribute('stroke-width','3');
                shine.setAttribute('stroke-linecap','round'); g.appendChild(shine);
                for(let mm=0;mm<=nCm*10;mm++){
                    const x=x0+mm*pxPerCm/10;
                    let tH,sw,col;
                    if(mm%10===0){tH=20;sw=1.6;col='#223';}
                    else if(mm%5===0){tH=14;sw=1.2;col='#446';}
                    else{tH=7;sw=0.8;col='#779';}
                    const ln=document.createElementNS(NS,'line');
                    ln.setAttribute('x1',x.toFixed(1)); ln.setAttribute('y1',(yBottom-tH).toString());
                    ln.setAttribute('x2',x.toFixed(1)); ln.setAttribute('y2',yBottom.toString());
                    ln.setAttribute('stroke',col); ln.setAttribute('stroke-width',sw.toString());
                    g.appendChild(ln);
                    if(mm%10===0&&mm>0){
                        const tx=document.createElementNS(NS,'text');
                        tx.setAttribute('x',x.toFixed(1)); tx.setAttribute('y',(yTop+16).toString());
                        tx.setAttribute('text-anchor','middle'); tx.setAttribute('font-size','13');
                        tx.setAttribute('font-weight','bold'); tx.setAttribute('fill','#223');
                        tx.textContent=String(mm/10); g.appendChild(tx);
                    }
                }
            }

            async function slideRuler(gId, dyFrom, dyTo, dur) {
                const g=document.getElementById(gId); g.style.opacity='1';
                const N=28;
                for(let i=0;i<=N;i++){
                    const dy=dyFrom+(dyTo-dyFrom)*i/N;
                    g.setAttribute('transform',`translate(0,${dy.toFixed(1)})`);
                    await sleep(dur/N);
                }
                if(dyTo<0) g.style.opacity='0';
            }

            buildRuler('rul3', 100, 300, 5, 50);

            function buildRap(gId, R, target, showLabels){
                const g=document.getElementById(gId);
                const NS='http://www.w3.org/2000/svg';
                const bg=document.createElementNS(NS,'path');
                bg.setAttribute('d',`M ${R} 0 A ${R} ${R} 0 0 0 ${-R} 0 Z`);
                bg.setAttribute('fill','rgba(255,252,200,0.90)');
                bg.setAttribute('stroke','#999'); bg.setAttribute('stroke-width','1.5');
                g.appendChild(bg);
                for(let d=0;d<=180;d+=10){
                    const r=d*Math.PI/180, maj=d%30===0, inner=R-(maj?16:8);
                    const mk=document.createElementNS(NS,'line');
                    mk.setAttribute('x1',(R*Math.cos(r)).toFixed(1));
                    mk.setAttribute('y1',(-R*Math.sin(r)).toFixed(1));
                    mk.setAttribute('x2',(inner*Math.cos(r)).toFixed(1));
                    mk.setAttribute('y2',(-inner*Math.sin(r)).toFixed(1));
                    mk.setAttribute('stroke',d===target?'#c0392b':'#666');
                    mk.setAttribute('stroke-width',d===target?'2.8':(maj?'2':'1.2'));
                    g.appendChild(mk);
                    if(maj && showLabels){
                        const tx=document.createElementNS(NS,'text');
                        tx.setAttribute('x',((R+13)*Math.cos(r)).toFixed(1));
                        tx.setAttribute('y',(-(R+13)*Math.sin(r)+4).toFixed(1));
                        tx.setAttribute('text-anchor','middle');
                        tx.setAttribute('font-size','11'); tx.setAttribute('fill','#555');
                        tx.textContent=String(d); g.appendChild(tx);
                    }
                }
                const bl=document.createElementNS(NS,'line');
                bl.setAttribute('x1',(-R-5).toString()); bl.setAttribute('y1','0');
                bl.setAttribute('x2',(R+5).toString());  bl.setAttribute('y2','0');
                bl.setAttribute('stroke','#888'); bl.setAttribute('stroke-width','1.5');
                g.appendChild(bl);
                const dot=document.createElementNS(NS,'circle');
                dot.setAttribute('cx','0'); dot.setAttribute('cy','0');
                dot.setAttribute('r','3'); dot.setAttribute('fill','#333');
                g.appendChild(dot);
                const ind=document.createElementNS(NS,'line');
                ind.setAttribute('id',gId+'_ind');
                ind.setAttribute('x1','0'); ind.setAttribute('y1','0');
                ind.setAttribute('x2',(R*0.88).toFixed(1)); ind.setAttribute('y2','0');
                ind.setAttribute('stroke','#e74c3c'); ind.setAttribute('stroke-width','2.8');
                ind.setAttribute('opacity','0'); g.appendChild(ind);
            }

            async function sweep(gId, R, targetDeg, dur){
                const ind=document.getElementById(gId+'_ind');
                ind.setAttribute('opacity','1');
                const N=45;
                for(let i=0;i<=N;i++){
                    const r=(targetDeg*i/N)*Math.PI/180;
                    ind.setAttribute('x2',(R*0.88*Math.cos(r)).toFixed(1));
                    ind.setAttribute('y2',(-R*0.88*Math.sin(r)).toFixed(1));
                    await sleep(dur/N);
                }
            }

            // Initialisation des rapporteurs
            buildRap('rapB3', R_RAP, 40, true);
            // rapC3 a transform scale(-1,1) : 0° pointe à gauche (vers B), les graduations sont symétriques
            buildRap('rapC3', R_RAP, 65, false);

            window.next3 = async function(){
                if(anim || step>=6) return;
                const btn=document.getElementById('btn3');
                btn.disabled=true;
                anim=true; step++;
                document.getElementById('st3').textContent=texts[step];

                if(step===1){
                    // Règle glisse → trace [BC] → règle repart
                    await slideRuler('rul3', -150, 0, 480);
                    await sleep(200);
                    show('labsBC3');
                    const seg=document.getElementById('segBC3');
                    seg.style.opacity='1';
                    const N=40;
                    for(let i=0;i<=N;i++){
                        seg.setAttribute('x2',(100+(350-100)*i/N).toFixed(1));
                        await sleep(700/N);
                    }
                    await sleep(300);
                    await slideRuler('rul3', 0, -150, 380);

                }else if(step===2){
                    show('rapB3');
                    await sleep(500);
                    await sweep('rapB3', R_RAP, 40, 1000);
                    await sleep(600);
                    show('amkB3'); show('atxB3');
                    await sleep(800);
                    hide('rapB3');

                }else if(step===3){
                    show('rayBA3');

                }else if(step===4){
                    show('rapC3');
                    await sleep(500);
                    await sweep('rapC3', R_RAP, 65, 1200);
                    await sleep(600);
                    show('amkC3'); show('atxC3');
                    await sleep(800);
                    hide('rapC3');

                }else if(step===5){
                    show('rayCA3');

                }else if(step===6){
                    show('ptA3');
                    await sleep(400);
                    hide('rayBA3'); hide('rayCA3');
                    show('sdAB3'); show('sdAC3');
                    btn.textContent='— Fin —';
                    btn.style.backgroundColor='#888';
                }

                anim=false;
                if(step<6) btn.disabled=false;
            };

            window.reset3 = function(){
                step=0; anim=false;
                document.getElementById('st3').textContent=texts[0];
                ['segBC3','labsBC3','rapB3','amkB3','atxB3',
                 'rayBA3','rapC3','amkC3','atxC3','rayCA3','ptA3','sdAB3','sdAC3'].forEach(hide);
                document.getElementById('segBC3').setAttribute('x2','100');
                document.getElementById('rul3').setAttribute('transform','translate(0,-150)');
                document.getElementById('rul3').style.opacity='0';
                ['rapB3_ind','rapC3_ind'].forEach(id=>{
                    const el=document.getElementById(id);
                    if(el){el.setAttribute('x2',(R_RAP*0.88).toFixed(1)); el.setAttribute('y2','0');}
                });
                const btn=document.getElementById('btn3');
                btn.disabled=false; btn.textContent='Étape suivante ▶';
                btn.style.backgroundColor='#3498db';
            };
        })();

/* ════════════════════════════════════════════════════════════ */

(function(){
            let step=0, anim=false;
            const texts=[
                'Cliquez sur « Étape suivante » pour voir la construction.',
                'Étape 1 – On trace le segment [AB] de longueur 6 cm à la règle.',
                'Étape 2 – On mesure AB = 6 cm. On reporte AB÷2 = 3 cm depuis A pour trouver le milieu I.',
                'Étape 3 – On place l\'équerre en I : l\'angle droit sur I, un côté le long de [AB].',
                'Étape 4 – On trace la médiatrice le long du côté perpendiculaire de l\'équerre. On retire l\'équerre.'
            ];

            function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

            /* ── Règle ── */
            function buildRuler(gId,x0,yBottom,nCm,ppCm){
                const g=document.getElementById(gId),NS='http://www.w3.org/2000/svg';
                const h=38,yTop=yBottom-h,tw=nCm*ppCm+24,xs=x0-8;
                const rc=document.createElementNS(NS,'rect');
                rc.setAttribute('x',xs);rc.setAttribute('y',yTop);rc.setAttribute('width',tw);rc.setAttribute('height',h);
                rc.setAttribute('rx','3');rc.setAttribute('fill','rgba(215,235,255,0.93)');rc.setAttribute('stroke','#4488bb');rc.setAttribute('stroke-width','1.8');g.appendChild(rc);
                const ed=document.createElementNS(NS,'line');
                ed.setAttribute('x1',xs);ed.setAttribute('y1',yBottom);ed.setAttribute('x2',(xs+tw).toString());ed.setAttribute('y2',yBottom);
                ed.setAttribute('stroke','#2266aa');ed.setAttribute('stroke-width','2.5');g.appendChild(ed);
                const sh=document.createElementNS(NS,'line');
                sh.setAttribute('x1',(xs+4).toString());sh.setAttribute('y1',(yTop+4).toString());sh.setAttribute('x2',(xs+tw-4).toString());sh.setAttribute('y2',(yTop+4).toString());
                sh.setAttribute('stroke','rgba(255,255,255,0.65)');sh.setAttribute('stroke-width','3');sh.setAttribute('stroke-linecap','round');g.appendChild(sh);
                for(let mm=0;mm<=nCm*10;mm++){
                    const x=x0+mm*ppCm/10;let tH,sw,col;
                    if(mm%10===0){tH=22;sw=1.6;col='#223';}else if(mm%5===0){tH=14;sw=1.2;col='#446';}else{tH=7;sw=0.8;col='#779';}
                    const ln=document.createElementNS(NS,'line');
                    ln.setAttribute('x1',x.toFixed(1));ln.setAttribute('y1',(yBottom-tH).toString());ln.setAttribute('x2',x.toFixed(1));ln.setAttribute('y2',yBottom.toString());
                    ln.setAttribute('stroke',col);ln.setAttribute('stroke-width',sw.toString());g.appendChild(ln);
                    if(mm%10===0&&mm>0){
                        const tx=document.createElementNS(NS,'text');
                        tx.setAttribute('x',x.toFixed(1));tx.setAttribute('y',(yTop+16).toString());
                        tx.setAttribute('text-anchor','middle');tx.setAttribute('font-size','13');tx.setAttribute('font-weight','bold');tx.setAttribute('fill','#223');
                        tx.textContent=String(mm/10);g.appendChild(tx);
                    }
                }
            }
            async function slideRuler(gId,d0,d1,dur){
                const g=document.getElementById(gId);g.style.opacity='1';const N=28;
                for(let i=0;i<=N;i++){const d=d0+(d1-d0)*i/N;g.setAttribute('transform',`translate(0,${d.toFixed(1)})`);await sleep(dur/N);}
                if(d1<0)g.style.opacity='0';
            }

            /* ── Équerre (triangle rectangle) ──
               angle droit à (0,0), jambe H vers la droite (leg=75px), jambe V vers le haut (leg=90px)
               Positionnée par translate(cx, cy) sur le SVG */
            function buildEq(gId){
                const g=document.getElementById(gId),NS='http://www.w3.org/2000/svg';
                // Corps
                const poly=document.createElementNS(NS,'polygon');
                poly.setAttribute('points','0,0 75,0 0,-92');
                poly.setAttribute('fill','rgba(180,220,255,0.82)');
                poly.setAttribute('stroke','#2255aa');poly.setAttribute('stroke-width','2');
                g.appendChild(poly);
                // Angle droit
                const sq=document.createElementNS(NS,'polyline');
                sq.setAttribute('points','11,0 11,-11 0,-11');
                sq.setAttribute('stroke','#1144aa');sq.setAttribute('stroke-width','1.8');sq.setAttribute('fill','none');
                g.appendChild(sq);
            }
            async function slideEq(xFrom,xTo,dur){
                const g=document.getElementById('eqme');g.style.opacity='1';const N=36;
                for(let i=0;i<=N;i++){
                    const x=xFrom+(xTo-xFrom)*i/N;
                    g.setAttribute('transform',`translate(${x.toFixed(1)},240)`);
                    await sleep(dur/N);
                }
            }
            async function fadeEq(dur){
                const g=document.getElementById('eqme');const N=18;
                for(let i=N;i>=0;i--){
                    g.style.opacity=(i/N).toFixed(2);await sleep(dur/N);
                }
                g.style.opacity='0';
            }
            /* ── Médiatrice tracée progressivement (haut vers bas depuis I) ── */
            async function drawMed(dur){
                const el=document.getElementById('medme');el.style.opacity='1';
                // Anime via stroke-dashoffset
                const len=230; // longueur totale
                el.style.strokeDasharray=len+' '+len;
                el.style.strokeDashoffset=len;
                const N=40;
                for(let i=0;i<=N;i++){
                    el.style.strokeDashoffset=String(len*(1-i/N));
                    await sleep(dur/N);
                }
                el.style.strokeDasharray='9,4';
                el.style.strokeDashoffset='0';
            }

            buildRuler('rulME',80,240,6,50);
            buildRuler('rulME2',80,240,6,50);
            buildEq('eqme');

            window.nextME=async function(){
                if(anim||step>=4)return;
                const btn=document.getElementById('btnME');btn.disabled=true;anim=true;step++;
                document.getElementById('stME').textContent=texts[step];

                if(step===1){
                    // Règle trace AB
                    await slideRuler('rulME',-150,0,480);await sleep(200);
                    document.getElementById('grpABme').style.opacity='1';
                    const seg=document.getElementById('segABme');seg.style.opacity='1';
                    const N=40;for(let i=0;i<=N;i++){seg.setAttribute('x2',(80+(380-80)*i/N).toFixed(1));await sleep(700/N);}
                    await sleep(300);await slideRuler('rulME',0,-150,380);

                }else if(step===2){
                    // Règle mesure le milieu : réapparaît, indicateur se déplace vers I
                    await slideRuler('rulME2',-150,0,480);await sleep(400);
                    // Point I apparaît progressivement
                    document.getElementById('milme').style.opacity='1';
                    await sleep(600);
                    await slideRuler('rulME2',0,-150,380);

                }else if(step===3){
                    // Équerre glisse depuis A jusqu'en I=(230,240)
                    await slideEq(80,230,900);

                }else if(step===4){
                    // Médiatrice se trace + angle droit + équerre disparaît
                    await drawMed(900);
                    document.getElementById('adme').style.opacity='1';
                    await sleep(300);
                    await fadeEq(500);
                    btn.textContent='— Fin —';btn.style.backgroundColor='#888';
                }
                anim=false;if(step<4)btn.disabled=false;
            };

            window.resetME=function(){
                step=0;anim=false;
                document.getElementById('stME').textContent=texts[0];
                ['grpABme','milme','eqme','adme'].forEach(id=>document.getElementById(id).style.opacity='0');
                document.getElementById('segABme').setAttribute('x2','80');
                const med=document.getElementById('medme');med.style.opacity='0';med.style.strokeDasharray='9,4';med.style.strokeDashoffset='0';
                ['rulME','rulME2'].forEach(id=>{
                    document.getElementById(id).setAttribute('transform','translate(0,-150)');
                    document.getElementById(id).style.opacity='0';
                });
                const btn=document.getElementById('btnME');btn.disabled=false;btn.textContent='Étape suivante ▶';btn.style.backgroundColor='#3498db';
            };
        })();

/* ════════════════════════════════════════════════════════════ */

(function(){
            const A={x:80,y:240}, B={x:420,y:240};
            const r=180; // rayon > AB/2=170
            // Intersections des deux arcs :
            // x = 250, y = 240 ± sqrt(180²-170²) = 240 ± 60
            const P1={x:250,y:180}, P2={x:250,y:300};
            let step=0, anim=false;

            const texts=[
                'Cliquez sur « Étape suivante » pour voir la construction.',
                'Étape 1 – On trace le segment [AB] à la règle.',
                'Étape 2 – On règle le compas sur un rayon supérieur à la moitié de AB. Pointe sèche en A, on trace un arc au-dessus et en-dessous.',
                'Étape 3 – Sans changer l\'écartement, pointe en B, on trace un second arc.',
                'Étape 4 – La médiatrice passe par les deux points d\'intersection des arcs. On trace la droite.'
            ];

            function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

            /* ── Règle ── */
            function buildRuler(gId,x0,yBottom,nCm,ppCm){
                const g=document.getElementById(gId),NS='http://www.w3.org/2000/svg';
                const h=38,yTop=yBottom-h,tw=nCm*ppCm+24,xs=x0-8;
                const rc=document.createElementNS(NS,'rect');
                rc.setAttribute('x',xs);rc.setAttribute('y',yTop);rc.setAttribute('width',tw);rc.setAttribute('height',h);
                rc.setAttribute('rx','3');rc.setAttribute('fill','rgba(215,235,255,0.93)');rc.setAttribute('stroke','#4488bb');rc.setAttribute('stroke-width','1.8');g.appendChild(rc);
                const ed=document.createElementNS(NS,'line');
                ed.setAttribute('x1',xs);ed.setAttribute('y1',yBottom);ed.setAttribute('x2',(xs+tw).toString());ed.setAttribute('y2',yBottom);
                ed.setAttribute('stroke','#2266aa');ed.setAttribute('stroke-width','2.5');g.appendChild(ed);
                const sh=document.createElementNS(NS,'line');
                sh.setAttribute('x1',(xs+4).toString());sh.setAttribute('y1',(yTop+4).toString());sh.setAttribute('x2',(xs+tw-4).toString());sh.setAttribute('y2',(yTop+4).toString());
                sh.setAttribute('stroke','rgba(255,255,255,0.65)');sh.setAttribute('stroke-width','3');sh.setAttribute('stroke-linecap','round');g.appendChild(sh);
                for(let mm=0;mm<=nCm*10;mm++){
                    const x=x0+mm*ppCm/10;let tH,sw,col;
                    if(mm%10===0){tH=22;sw=1.6;col='#223';}else if(mm%5===0){tH=14;sw=1.2;col='#446';}else{tH=7;sw=0.8;col='#779';}
                    const ln=document.createElementNS(NS,'line');
                    ln.setAttribute('x1',x.toFixed(1));ln.setAttribute('y1',(yBottom-tH).toString());ln.setAttribute('x2',x.toFixed(1));ln.setAttribute('y2',yBottom.toString());
                    ln.setAttribute('stroke',col);ln.setAttribute('stroke-width',sw.toString());g.appendChild(ln);
                    if(mm%10===0&&mm>0){
                        const tx=document.createElementNS(NS,'text');
                        tx.setAttribute('x',x.toFixed(1));tx.setAttribute('y',(yTop+16).toString());
                        tx.setAttribute('text-anchor','middle');tx.setAttribute('font-size','13');tx.setAttribute('font-weight','bold');tx.setAttribute('fill','#223');
                        tx.textContent=String(mm/10);g.appendChild(tx);
                    }
                }
            }
            async function slideRuler(gId,d0,d1,dur){
                const g=document.getElementById(gId);g.style.opacity='1';const N=28;
                for(let i=0;i<=N;i++){const d=d0+(d1-d0)*i/N;g.setAttribute('transform',`translate(0,${d.toFixed(1)})`);await sleep(dur/N);}
                if(d1<0)g.style.opacity='0';
            }

            /* ── Compas ── */
            function setC(dry,pen){
                const hx=(dry.x+pen.x)/2,hy=(dry.y+pen.y)/2;
                document.getElementById('mcH').setAttribute('cx',hx);document.getElementById('mcH').setAttribute('cy',hy);
                const pb=document.getElementById('mcPb');pb.setAttribute('x1',hx);pb.setAttribute('y1',hy);pb.setAttribute('x2',dry.x);pb.setAttribute('y2',dry.y);
                document.getElementById('mcPt').setAttribute('cx',dry.x);document.getElementById('mcPt').setAttribute('cy',dry.y);
                const nb=document.getElementById('mcNb');nb.setAttribute('x1',hx);nb.setAttribute('y1',hy);nb.setAttribute('x2',pen.x);nb.setAttribute('y2',pen.y);
                const ang=Math.atan2(pen.y-hy,pen.x-hx),deg=ang*180/Math.PI;
                document.getElementById('mcBd').setAttribute('transform',`translate(${pen.x},${pen.y-9}) rotate(${deg+90})`);
                document.getElementById('mcTp').setAttribute('transform',`translate(${pen.x-4},${pen.y}) rotate(${deg+90} 4 0)`);
                document.getElementById('mcPp').setAttribute('cx',pen.x);document.getElementById('mcPp').setAttribute('cy',pen.y);
            }
            async function openC(center,target,dur){
                const N=30;
                for(let i=0;i<=N;i++){
                    const t=i/N;setC(center,{x:center.x+(target.x-center.x)*t,y:center.y+(target.y-center.y)*t});await sleep(dur/N);
                }
            }
            async function moveC(fp,fe,tp,te,dur){
                const N=40;
                for(let i=0;i<=N;i++){
                    const t=i/N;
                    setC({x:fp.x+(tp.x-fp.x)*t,y:fp.y+(tp.y-fp.y)*t},{x:fe.x+(te.x-fe.x)*t,y:fe.y+(te.y-fe.y)*t});
                    await sleep(dur/N);
                }
            }

            /* ── Arc progressif ── */
            async function drawArc(pathId,cx,cy,radius,a0,a1,dur){
                const el=document.getElementById(pathId);el.style.opacity='1';
                const N=55;let d='';
                for(let i=0;i<=N;i++){
                    const a=a0+(a1-a0)*i/N;
                    const px=(cx+radius*Math.cos(a)).toFixed(1),py=(cy+radius*Math.sin(a)).toFixed(1);
                    d+=(i===0?'M ':'L ')+px+' '+py+' ';
                    el.setAttribute('d',d);
                    setC(i===0?{x:cx,y:cy}:{x:cx,y:cy},{x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a)});
                    if(i<N)await sleep(dur/N);
                }
            }

            /* ── Arc partiel (ajoute au path existant sans effacer) ── */
            async function drawArcPartial(pathId,cx,cy,radius,a0,a1,dur){
                const el=document.getElementById(pathId);el.style.opacity='1';
                const N=25;
                let d=el.getAttribute('d')||'';
                for(let i=0;i<=N;i++){
                    const a=a0+(a1-a0)*i/N;
                    const px=(cx+radius*Math.cos(a)).toFixed(1),py=(cy+radius*Math.sin(a)).toFixed(1);
                    d+=(i===0?' M ':' L ')+px+' '+py;
                    el.setAttribute('d',d);
                    setC({x:cx,y:cy},{x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a)});
                    if(i<N)await sleep(dur/N);
                }
            }

            buildRuler('rulMC',80,240,7,50);

            window.nextMC=async function(){
                if(anim||step>=4)return;
                const btn=document.getElementById('btnMC');btn.disabled=true;anim=true;step++;
                document.getElementById('stMC').textContent=texts[step];

                if(step===1){
                    await slideRuler('rulMC',-150,0,480);await sleep(200);
                    document.getElementById('grpABmc').style.opacity='1';
                    const seg=document.getElementById('segABmc');seg.style.opacity='1';
                    const N=40;for(let i=0;i<=N;i++){seg.setAttribute('x2',(80+(420-80)*i/N).toFixed(1));await sleep(700/N);}
                    await sleep(300);await slideRuler('rulMC',0,-150,380);

                }else if(step===2){
                    // Compas depuis A : ouverture jusqu'à P1 (rayon = dist A→P1)
                    const cmp=document.getElementById('cmpMC');cmp.style.opacity='1';
                    setC(A,A);await sleep(300);
                    await openC(A,P1,1200);await sleep(300);
                    // Arc depuis A : de l'angle vers P1 jusqu'à P2 (demi-arc ~120° de chaque côté)
                    const aA0=Math.atan2(P1.y-A.y,P1.x-A.x)-0.3;
                    const aA1=Math.atan2(P2.y-A.y,P2.x-A.x)+0.3;
                    await drawArc('arcAmc',A.x,A.y,r,aA0,aA1,1400);
                    // Le compas RESTE ouvert et visible — on le déplace vers B
                    await sleep(500);

                }else if(step===3){
                    // Compas se déplace de A vers B EN GARDANT le même écartement
                    const cmp=document.getElementById('cmpMC');cmp.style.opacity='1';
                    // Position actuelle : pointe en A, crayon en direction de P1
                    const penCurr={x:A.x+r*Math.cos(Math.atan2(P1.y-A.y,P1.x-A.x)),
                                   y:A.y+r*Math.sin(Math.atan2(P1.y-A.y,P1.x-A.x))};
                    // Position cible : pointe en B, crayon même direction angulaire (vers P1 depuis B)
                    const angToP1fromB=Math.atan2(P1.y-B.y,P1.x-B.x);
                    const penTarget={x:B.x+r*Math.cos(angToP1fromB),
                                     y:B.y+r*Math.sin(angToP1fromB)};
                    // Déplacement en gardant l'écartement constant
                    await moveC(A,penCurr,B,penTarget,900);
                    await sleep(300);
                    // Arc PARTIEL depuis B : juste autour des deux intersections (±0.4 rad)
                    const aB_P1=Math.atan2(P1.y-B.y,P1.x-B.x);
                    const aB_P2=Math.atan2(P2.y-B.y,P2.x-B.x);
                    // Tracer deux petits arcs séparés autour de chaque intersection
                    await drawArcPartial('arcBmc',B.x,B.y,r,aB_P1-0.35,aB_P1+0.35,600);
                    await drawArcPartial('arcBmc',B.x,B.y,r,aB_P2-0.35,aB_P2+0.35,600);
                    await sleep(400);
                    document.getElementById('ptsmc').style.opacity='1';
                    await sleep(400);cmp.style.opacity='0';

                }else if(step===4){
                    // Médiatrice + milieu I
                    document.getElementById('medmc').style.opacity='1';
                    await sleep(500);
                    document.getElementById('milmc').style.opacity='1';
                    btn.textContent='— Fin —';btn.style.backgroundColor='#888';
                }
                anim=false;if(step<4)btn.disabled=false;
            };

            window.resetMC=function(){
                step=0;anim=false;
                document.getElementById('stMC').textContent=texts[0];
                ['grpABmc','arcAmc','arcBmc','ptsmc','medmc','milmc','cmpMC'].forEach(id=>document.getElementById(id).style.opacity='0');
                document.getElementById('segABmc').setAttribute('x2','80');
                document.getElementById('arcAmc').setAttribute('d','');
                document.getElementById('arcBmc').setAttribute('d','');
                document.getElementById('rulMC').setAttribute('transform','translate(0,-150)');
                document.getElementById('rulMC').style.opacity='0';
                const btn=document.getElementById('btnMC');btn.disabled=false;btn.textContent='Étape suivante ▶';btn.style.backgroundColor='#3498db';
            };
        })();

/* ════════════════════════════════════════════════════════════ */

(function(){
            // Coordonnées
            const A={x:250,y:40}, B={x:80,y:270}, C={x:390,y:230};
            const O={x:229,y:202}, R=164;
            // Rayons des arcs pour chaque médiatrice
            const r_AB=180, r_BC=200;
            // Points d'intersection des arcs pour méd AB
            const P1AB={x:77,y:90}, P2AB={x:253,y:220};
            // Points d'intersection des arcs pour méd BC
            const P1BC={x:251,y:374}, P2BC={x:219,y:126};

            let step=0, anim=false;
            const texts=[
                'Cliquez sur « Étape suivante » pour voir la construction.',
                'Étape 1 – On trace la médiatrice de [AB] : compas depuis A puis depuis B (même écartement), les arcs se croisent en deux points.',
                'Étape 2 – On trace la droite passant par les deux points d\'intersection : c\'est la médiatrice de [AB].',
                'Étape 3 – On recommence avec [BC] : arcs depuis B puis depuis C.',
                'Étape 4 – On trace la médiatrice de [BC]. Son intersection avec la médiatrice de [AB] est le point O.',
                'Étape 5 – On ouvre le compas de O jusqu\'à A et on trace le cercle circonscrit.'
            ];

            function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
            function show(id){document.getElementById(id).style.opacity='1';}

            /* ── Compas ── */
            function setC(dry,pen){
                const hx=(dry.x+pen.x)/2,hy=(dry.y+pen.y)/2;
                ['ccH','ccPt','ccPp'].forEach(id=>document.getElementById(id));
                document.getElementById('ccH').setAttribute('cx',hx);
                document.getElementById('ccH').setAttribute('cy',hy);
                const pb=document.getElementById('ccPb');
                pb.setAttribute('x1',hx);pb.setAttribute('y1',hy);
                pb.setAttribute('x2',dry.x);pb.setAttribute('y2',dry.y);
                document.getElementById('ccPt').setAttribute('cx',dry.x);
                document.getElementById('ccPt').setAttribute('cy',dry.y);
                const nb=document.getElementById('ccNb');
                nb.setAttribute('x1',hx);nb.setAttribute('y1',hy);
                nb.setAttribute('x2',pen.x);nb.setAttribute('y2',pen.y);
                const ang=Math.atan2(pen.y-hy,pen.x-hx),deg=ang*180/Math.PI;
                document.getElementById('ccBd').setAttribute('transform',
                    `translate(${pen.x},${pen.y-9}) rotate(${deg+90})`);
                document.getElementById('ccTp').setAttribute('transform',
                    `translate(${pen.x-4},${pen.y}) rotate(${deg+90} 4 0)`);
                document.getElementById('ccPp').setAttribute('cx',pen.x);
                document.getElementById('ccPp').setAttribute('cy',pen.y);
            }
            async function openC(center,target,dur){
                const N=30;
                for(let i=0;i<=N;i++){
                    const t=i/N;
                    setC(center,{x:center.x+(target.x-center.x)*t,y:center.y+(target.y-center.y)*t});
                    await sleep(dur/N);
                }
            }
            // moveC avec rayon constant : le crayon garde la même distance au pivot
            async function moveCFixed(fromCenter,toCenter,radius,angle,dur){
                const N=40;
                for(let i=0;i<=N;i++){
                    const t=i/N;
                    const cx=fromCenter.x+(toCenter.x-fromCenter.x)*t;
                    const cy=fromCenter.y+(toCenter.y-fromCenter.y)*t;
                    setC({x:cx,y:cy},{x:cx+radius*Math.cos(angle),y:cy+radius*Math.sin(angle)});
                    await sleep(dur/N);
                }
            }
            async function drawArcAnim(pathId,cx,cy,radius,a0,a1,dur,updateCompass){
                const el=document.getElementById(pathId);el.style.opacity='1';
                const N=60;let d=el.getAttribute('d')||'';
                for(let i=0;i<=N;i++){
                    const a=a0+(a1-a0)*i/N;
                    const px=(cx+radius*Math.cos(a)).toFixed(1),py=(cy+radius*Math.sin(a)).toFixed(1);
                    d+=(i===0?' M ':' L ')+px+' '+py;
                    el.setAttribute('d',d);
                    if(updateCompass) setC({x:cx,y:cy},{x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a)});
                    if(i<N)await sleep(dur/N);
                }
            }
            async function drawCircle(dur){
                const el=document.getElementById('circCC');el.style.opacity='1';
                const N=70;let d='';
                for(let i=0;i<=N;i++){
                    const a=-Math.PI/2+(2*Math.PI)*i/N;
                    const px=(O.x+R*Math.cos(a)).toFixed(1),py=(O.y+R*Math.sin(a)).toFixed(1);
                    d+=(i===0?'M ':'L ')+px+' '+py+' ';
                    el.setAttribute('d',d);
                    setC(O,{x:O.x+R*Math.cos(a),y:O.y+R*Math.sin(a)});
                    if(i<N)await sleep(dur/N);
                }
            }

            window.nextCC=async function(){
                if(anim||step>=5)return;
                const btn=document.getElementById('btnCC');
                btn.disabled=true;anim=true;step++;
                document.getElementById('stCC').textContent=texts[step];
                const cmp=document.getElementById('cmpCC');

                if(step===1){
                    cmp.style.opacity='1';
                    setC(A,A); await sleep(300);
                    await openC(A,P1AB,1000); await sleep(200);
                    // Arc depuis A : borner VERS L'EXTÉRIEUR des deux intersections
                    // aA1 > aA2 → on va de (aA1+marge) down to (aA2-marge)
                    const aA1=Math.atan2(P1AB.y-A.y,P1AB.x-A.x); // ~2.86 rad
                    const aA2=Math.atan2(P2AB.y-A.y,P2AB.x-A.x); // ~1.56 rad
                    const margin=0.6;
                    const a0A = aA1+0.25;
                    const a1A = aA2-0.25;
                    await drawArcAnim('arcA1cc',A.x,A.y,r_AB,a0A,a1A,1400,true);
                    await sleep(400);
                    await moveCFixed(A,B,r_AB,aA1,800); await sleep(200);
                    const aB1=Math.atan2(P1AB.y-B.y,P1AB.x-B.x);
                    const aB2=Math.atan2(P2AB.y-B.y,P2AB.x-B.x);
                    const a0B2 = aB1-0.25;
                    const a1B2 = aB2+0.25;
                    await drawArcAnim('arcB1cc',B.x,B.y,r_AB,a0B2,a1B2,1400,true);
                    await sleep(400); cmp.style.opacity='0';

                }else if(step===2){
                    show('medABcc'); show('sqABcc');

                }else if(step===3){
                    cmp.style.opacity='1';
                    // Angles exacts depuis B vers les deux intersections
                    const aB_P2=Math.atan2(P2BC.y-B.y,P2BC.x-B.x);
                    const aB_P1=Math.atan2(P1BC.y-B.y,P1BC.x-B.x);
                    // Ouvrir le compas depuis B à r_BC dans la direction de P2BC
                    const penOpen={x:B.x+r_BC*Math.cos(aB_P2), y:B.y+r_BC*Math.sin(aB_P2)};
                    setC(B,B); await sleep(200);
                    await openC(B,penOpen,900); await sleep(200);
                    // Arc depuis B de P2BC à P1BC
                    await drawArcAnim('arcB2cc',B.x,B.y,r_BC,aB_P2-0.2,aB_P1+0.2,1200,true);
                    // Déplacer vers C en gardant r_BC et même angle de départ
                    await moveCFixed(B,C,r_BC,aB_P2,800); await sleep(200);
                    // Arc depuis C de P1BC à P2BC
                    const aC_P1=Math.atan2(P1BC.y-C.y,P1BC.x-C.x);
                    const aC_P2=Math.atan2(P2BC.y-C.y,P2BC.x-C.x)+2*Math.PI;
                    await drawArcAnim('arcC2cc',C.x,C.y,r_BC,aC_P1-0.2,aC_P2+0.2,1200,true);
                    await sleep(400); cmp.style.opacity='0';

                }else if(step===4){
                    // Médiatrice BC + point O
                    show('medBCcc'); show('sqBCcc');
                    await sleep(600);
                    show('ptOcc');

                }else if(step===5){
                    // Compas de O vers A → cercle
                    cmp.style.opacity='1';
                    setC(O,O); await sleep(300);
                    await openC(O,A,1000); await sleep(400);
                    await drawCircle(1600);
                    await sleep(300);cmp.style.opacity='0';
                    btn.textContent='— Fin —';btn.style.backgroundColor='#888';
                }
                anim=false;if(step<5)btn.disabled=false;
            };

            window.resetCC=function(){
                step=0;anim=false;
                document.getElementById('stCC').textContent=texts[0];
                ['arcA1cc','arcB1cc','medABcc','sqABcc',
                 'arcB2cc','arcC2cc','medBCcc','sqBCcc',
                 'ptOcc','circCC','cmpCC'].forEach(id=>{
                    const el=document.getElementById(id);
                    el.style.opacity='0';
                    if(el.tagName==='path')el.setAttribute('d','');
                });
                const btn=document.getElementById('btnCC');
                btn.disabled=false;btn.textContent='Étape suivante ▶';btn.style.backgroundColor='#3498db';
            };
        })();

/* ════════════════════════════════════════════════════════════ */

(function(){
            let step=0, anim=false;
            const texts=[
                'Cliquez sur « Étape suivante » pour voir la construction.',
                'Étape 1 – On place l\'équerre sur le côté [AB] : un côté de l\'angle droit longe [AB].',
                'Étape 2 – On fait glisser l\'équerre le long de [AB] jusqu\'à ce que l\'autre côté de l\'angle droit passe par le sommet C.',
                'Étape 3 – On trace le segment de C jusqu\'au pied H_C sur [AB]. C\'est la hauteur issue de C. On retire l\'équerre.'
            ];

            function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

            /* ── Équerre ── */
            function buildEqH(gId){
                const g=document.getElementById(gId), NS='http://www.w3.org/2000/svg';
                // legV doit atteindre C=(200,50) depuis y=280 → 230px vers le haut
                // legH large pour être visible sur [AB]
                const poly=document.createElementNS(NS,'polygon');
                poly.setAttribute('points','0,0 140,0 0,-240');
                poly.setAttribute('fill','rgba(180,220,255,0.72)');
                poly.setAttribute('stroke','#2255aa');poly.setAttribute('stroke-width','2');
                g.appendChild(poly);
                const sq=document.createElementNS(NS,'polyline');
                sq.setAttribute('points','14,0 14,-14 0,-14');
                sq.setAttribute('stroke','#1144aa');sq.setAttribute('stroke-width','1.8');sq.setAttribute('fill','none');
                g.appendChild(sq);
            }

            async function slideEqH(xFrom,xTo,dur){
                const g=document.getElementById('eqH');g.style.opacity='1';
                const N=40;
                for(let i=0;i<=N;i++){
                    const x=xFrom+(xTo-xFrom)*i/N;
                    g.setAttribute('transform',`translate(${x.toFixed(1)},280)`);
                    await sleep(dur/N);
                }
            }

            async function fadeEqH(dur){
                const g=document.getElementById('eqH');const N=18;
                for(let i=N;i>=0;i--){g.style.opacity=(i/N).toFixed(2);await sleep(dur/N);}
                g.style.opacity='0';
            }

            async function drawHauteur(dur){
                const el=document.getElementById('hautH');el.style.opacity='1';
                const len=230;
                el.style.strokeDasharray=len+' '+len;
                el.style.strokeDashoffset=len;
                const N=40;
                for(let i=0;i<=N;i++){
                    el.style.strokeDashoffset=String(len*(1-i/N));
                    await sleep(dur/N);
                }
                el.style.strokeDasharray='9,4';
                el.style.strokeDashoffset='0';
            }

            buildEqH('eqH');

            window.nextH=async function(){
                if(anim||step>=3)return;
                const btn=document.getElementById('btnH');
                btn.disabled=true;anim=true;step++;
                document.getElementById('stH').textContent=texts[step];

                if(step===1){
                    // Équerre arrive depuis la gauche et se pose en A
                    await slideEqH(-60,60,600);

                }else if(step===2){
                    // Équerre glisse vers x=200 (sous C)
                    await slideEqH(60,200,1000);

                }else if(step===3){
                    // Hauteur se trace + pied apparaît + équerre disparaît
                    await drawHauteur(800);
                    document.getElementById('piedH').style.opacity='1';
                    await sleep(300);
                    await fadeEqH(500);
                    btn.textContent='— Fin —';btn.style.backgroundColor='#888';
                }
                anim=false;if(step<3)btn.disabled=false;
            };

            window.resetH=function(){
                step=0;anim=false;
                document.getElementById('stH').textContent=texts[0];
                document.getElementById('eqH').style.opacity='0';
                document.getElementById('eqH').setAttribute('transform','translate(-60,280)');
                const h=document.getElementById('hautH');
                h.style.opacity='0';h.style.strokeDasharray='9,4';h.style.strokeDashoffset='0';
                document.getElementById('piedH').style.opacity='0';
                const btn=document.getElementById('btnH');
                btn.disabled=false;btn.textContent='Étape suivante ▶';btn.style.backgroundColor='#3498db';
            };
        })();

/* ════════════════════════════════════════════════════════════ */

const hauteurState = { hc: false, ha: false, hb: false, ortho: false };
            function toggleHauteur(id, btnId, color) {
                const el  = document.getElementById(id);
                const btn = document.getElementById(btnId);
                hauteurState[id] = !hauteurState[id];
                el.style.opacity = hauteurState[id] ? '1' : '0';
                btn.style.backgroundColor = hauteurState[id] ? '#555' : color;
            }
            function resetHauteurs() {
                ['hc','ha','hb','ortho'].forEach(id => {
                    document.getElementById(id).style.opacity = '0';
                    hauteurState[id] = false;
                });
                document.getElementById('btnHc').style.backgroundColor    = '#e74c3c';
                document.getElementById('btnHa').style.backgroundColor    = '#3498db';
                document.getElementById('btnHb').style.backgroundColor    = '#27ae60';
                document.getElementById('btnOrtho').style.backgroundColor = '#8e44ad';
            }
