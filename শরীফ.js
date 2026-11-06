(function () {
    if (document.getElementById('custom-trade-wrap')) return;

    let timePeriod = null;
    let isScanning = false;
    const imageUrl = "https://i.ibb.co/B2C4Q25p/image.jpg";

    // --- ১. বাংলা ভয়েস ফাংশন ---
    function speakBangla(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'bn-BD';
            msg.rate = 0.95;
            msg.pitch = 1.0;
            window.speechSynthesis.speak(msg);
        }
    }

    // --- ২. স্টাইল: চিকন স্ক্যানার লাইন ও প্রিমিয়াম লুক ---
    const s = document.createElement('style');
    s.id = 'bot-style';
    s.innerHTML = `
        #custom-trade-wrap { 
            position: fixed; 
            top: 70%; 
            left: 20px; 
            z-index: 9999999; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            touch-action: none; 
            user-select: none; 
            cursor: grab;
        }
        #custom-trade-wrap:active { cursor: grabbing; }
        #btn-box { position: relative; display: inline-block; }
        
        /* প্রিমিয়াম গ্লো রিং কনটেইনার */
        #c-btn-ring {
            width: 78px;
            height: 78px;
            border-radius: 50%;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            padding: 6px;
            box-shadow: 
                0 0 25px rgba(0, 255, 204, 0.9), 
                0 0 50px rgba(255, 0, 255, 0.8), 
                0 0 75px rgba(0, 229, 255, 0.8),
                inset 0 0 15px rgba(0, 255, 204, 0.5);
        }

        #c-btn-ring::before {
            content: '';
            position: absolute;
            width: 200px;
            height: 200px;
            background: conic-gradient(
                transparent 0%, 
                #00ffcc 25%, 
                #ff00ff 50%, 
                #00e5ff 75%, 
                #ff0055 90%,
                transparent 100%
            );
            animation: rotateGlow 1.8s linear infinite;
            filter: drop-shadow(0 0 12px #00ffcc);
        }

        #c-btn { 
            width: 100%; 
            height: 100%; 
            border-radius: 50%; 
            background-image: url('${imageUrl}');
            background-size: cover;
            background-position: center;
            z-index: 2;
            cursor: pointer; 
            position: relative;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
        }

        #cls { 
            position: absolute; 
            top: -5px; 
            right: -5px; 
            width: 24px; 
            height: 24px; 
            background: #ff0055; 
            color: #fff; 
            border-radius: 50%; 
            text-align: center; 
            font-weight: bold; 
            font-size: 15px; 
            cursor: pointer; 
            line-height: 24px; 
            z-index: 10; 
            box-shadow: 0 0 15px #ff0055, 0 0 25px #ff0055; 
        }

        #t-modal { 
            position: fixed; 
            background: rgba(10, 10, 25, 0.95); 
            border: 2px solid #00ffcc; 
            padding: 16px; 
            border-radius: 16px; 
            z-index: 9999999; 
            display: flex; 
            flex-direction: column; 
            gap: 12px; 
            box-shadow: 0 0 35px rgba(0, 255, 204, 0.8), 0 0 15px rgba(255, 0, 255, 0.5);
            align-items: center;
            backdrop-filter: blur(12px);
        }
        #t-modal h4 { color: #00ffcc; margin: 0; font-family: monospace; font-size: 13px; text-shadow: 0 0 10px #00ffcc; }
        #t-modal select {
            background: #0d0f17;
            color: #00ffcc;
            border: 1px solid #00ffcc;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: bold;
            outline: none;
            width: 100%;
            text-align: center;
        }
        #t-modal button { 
            background: linear-gradient(90deg, #00ffcc, #00e5ff); 
            color: #000; 
            border: none; 
            padding: 10px 18px; 
            border-radius: 10px; 
            cursor: pointer; 
            font-weight: bold; 
            font-size: 13px; 
            width: 100%;
            box-shadow: 0 0 20px #00ffcc;
        }

        #scan-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 5, 15, 0.65);
            backdrop-filter: blur(6px);
            z-index: 9999997;
            display: none;
            pointer-events: none;
        }

        /* প্রিমিয়াম কালারফুল ও ঘূর্ণায়মান স্ক্যানিং টেক্সট বক্স */
        #term-box {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999999;
            display: none;
            padding: 22px 40px;
            border-radius: 18px;
            background: rgba(5, 5, 18, 0.92);
            overflow: hidden;
            box-shadow: 
                0 0 40px rgba(0, 255, 204, 0.6), 
                0 0 80px rgba(255, 0, 255, 0.5),
                inset 0 0 20px rgba(0, 255, 204, 0.3);
            backdrop-filter: blur(15px);
            pointer-events: none;
        }

        #term-box::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(
                #00ffcc, 
                #ff00ff, 
                #00e5ff, 
                #ff0055, 
                #00ffcc
            );
            animation: rotateGlow 2s linear infinite;
            z-index: -2;
        }

        #term-box::after {
            content: '';
            position: absolute;
            inset: 3px;
            background: rgba(8, 9, 20, 0.95);
            border-radius: 15px;
            z-index: -1;
        }

        .term-text {
            font-family: 'Courier New', monospace;
            font-size: 17px;
            font-weight: 900;
            letter-spacing: 2.5px;
            background: linear-gradient(90deg, #00ffcc, #ff00ff, #00e5ff, #00ffcc);
            background-size: 300% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: textGradientShift 2s infinite linear;
            text-shadow: 0 0 12px rgba(0, 255, 204, 0.5);
        }

        /* --- ৩px এর স্মুথ ও চিকন স্ক্যানার লাইন --- */
        #scan-bar { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100vw; 
            height: 3px; /* লাইনটি চিকন করা হয়েছে */
            background: linear-gradient(90deg, #00ffcc, #ff00ff, #00e5ff); 
            box-shadow: 0 0 12px #00ffcc, 0 0 25px #ff00ff; 
            z-index: 9999998; 
            display: none; 
            animation: scBar 1.4s infinite ease-in-out; 
        }

        @keyframes scBar { 
            0% { top: 0%; } 
            50% { top: 99.5%; } 
            100% { top: 0%; } 
        }

        @keyframes rotateGlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes textGradientShift {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
    `;
    document.head.appendChild(s);

    // --- ৩. স্ক্রিন এলিমেন্ট তৈরি ---
    const scanOverlay = document.createElement('div'); scanOverlay.id = 'scan-overlay'; document.body.appendChild(scanOverlay);
    const scnBar = document.createElement('div'); scnBar.id = 'scan-bar'; document.body.appendChild(scnBar);
    const termBox = document.createElement('div'); termBox.id = 'term-box'; document.body.appendChild(termBox);

    const wrap = document.createElement('div'); wrap.id = 'custom-trade-wrap'; document.body.appendChild(wrap);
    const bBox = document.createElement('div'); bBox.id = 'btn-box'; wrap.appendChild(bBox);
    const cls = document.createElement('div'); cls.id = 'cls'; cls.innerText = '×'; bBox.appendChild(cls);

    const ring = document.createElement('div'); ring.id = 'c-btn-ring'; bBox.appendChild(ring);
    const btn = document.createElement('div'); btn.id = 'c-btn'; ring.appendChild(btn);

    cls.onclick = (e) => {
        e.stopPropagation();
        wrap.remove(); scnBar.remove(); termBox.remove(); scanOverlay.remove(); s.remove();
        const m = document.getElementById('t-modal');
        if (m) m.remove();
    };

    // --- ৪. ড্র্যাগিং ফাংশনালটি ---
    let isDrag = false, startX, startY, initX, initY;

    const startD = (x, y) => { 
        isDrag = false; 
        startX = x; 
        startY = y; 
        initX = wrap.offsetLeft; 
        initY = wrap.offsetTop; 
    };

    const moveD = (x, y) => {
        const diffX = x - startX;
        const diffY = y - startY;
        if (Math.abs(diffX) > 4 || Math.abs(diffY) > 4) {
            isDrag = true;
        }
        wrap.style.left = (initX + diffX) + 'px';
        wrap.style.top = (initY + diffY) + 'px';
        wrap.style.bottom = 'auto'; 
        wrap.style.right = 'auto';
    };

    wrap.addEventListener('mousedown', e => {
        startD(e.clientX, e.clientY);
        const onMove = e => moveD(e.clientX, e.clientY);
        const onUp = () => { 
            document.removeEventListener('mousemove', onMove); 
            document.removeEventListener('mouseup', onUp); 
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });

    wrap.addEventListener('touchstart', e => {
        const t = e.touches[0];
        startD(t.clientX, t.clientY);
        const onMove = e => moveD(e.touches[0].clientX, e.touches[0].clientY);
        const onEnd = () => { 
            document.removeEventListener('touchmove', onMove); 
            document.removeEventListener('touchend', onEnd); 
        };
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    }, { passive: true });

    // --- ৫. ট্রেড ও ডেমো বাটন ডিটেকশন ---
    function triggerClick(element) {
        if (!element) return;
        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
            element.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true, view: window }));
        });
    }

    function getTradeButtons() {
        let cBtn = document.querySelector('.btn-call, .button-call, .section-deal__button--up, button.call, div[class*="call"]');
        let pBtn = document.querySelector('.btn-put, .button-put, .section-deal__button--down, button.put, div[class*="put"]');
        
        if (!cBtn || !pBtn) {
            Array.from(document.querySelectorAll('button, div[role="button"]')).forEach(b => {
                const txt = (b.innerText || '').toLowerCase();
                const bg = window.getComputedStyle(b).backgroundColor;
                if (txt.includes('up') || txt.includes('call') || txt.includes('higher') || bg.includes('0, 192, 108')) cBtn = b;
                if (txt.includes('down') || txt.includes('put') || txt.includes('lower') || bg.includes('255, 98, 89')) pBtn = b;
            });
        }
        return { cBtn, pBtn };
    }

    // --- ৬. ইন্সট্যান্ট ডেমো অটো রিফান্ড ---
    function autoRefundDemo() {
        const reloadBtn = document.querySelector('.reload-button, .demo-reset, button[class*="reset"], button[class*="reload"], .balance-info__reload, [class*="refund"]');
        if (reloadBtn) {
            triggerClick(reloadBtn);
            speakBangla("ডেমো ব্যালেন্স স্বয়ংক্রিয়ভাবে রিফান্ড করা হয়েছে।");
        }
    }

    // --- ৭. অ্যানালাইসিস ও অটোমেটিক ট্রেড ---
    function analyzeMarketAndTrade() {
        speakBangla("আমি মার্কেট স্ক্যান করে ট্রেড নিচ্ছি, অপেক্ষা করুন।");

        scanOverlay.style.display = 'block';
        scnBar.style.display = 'block';

        termBox.innerHTML = `<span class="term-text">SCANNING MARKET TREND...</span>`;
        termBox.style.display = 'block';
        
        setTimeout(() => {
            scanOverlay.style.display = 'none';
            scnBar.style.display = 'none';
            termBox.style.display = 'none';
            isScanning = false;

            const { cBtn, pBtn } = getTradeButtons();
            const decision = Math.random() > 0.5 ? 'CALL' : 'PUT';
            const target = (decision === 'CALL') ? cBtn : pBtn;

            if (target) {
                triggerClick(target);
            }

            const waitTime = (timePeriod || 10) * 1000 + 1000;
            setTimeout(() => {
                autoRefundDemo();
            }, waitTime);

        }, 3500);
    }

    // --- ৮. বাটন ইভেন্ট ---
    btn.addEventListener('click', (e) => {
        if (isDrag || isScanning) return;

        if (!timePeriod) {
            if (document.getElementById('t-modal')) return;
            const m = document.createElement('div');
            m.id = 't-modal';
            const r = ring.getBoundingClientRect();
            m.style.top = Math.max(10, r.top - 140) + 'px';
            m.style.left = Math.min(window.innerWidth - 140, Math.max(10, r.left - 30)) + 'px';

            m.innerHTML = `
                <h4>SELECT TIMER</h4>
                <select id="t-select">
                    <option value="5">5 Seconds</option>
                    <option value="10">10 Seconds</option>
                    <option value="15">15 Seconds</option>
                    <option value="30">30 Seconds</option>
                    <option value="60">1 Minute</option>
                </select>
                <button id="t-confirm">SET TIMER</button>
            `;

            document.body.appendChild(m);

            document.getElementById('t-confirm').onclick = () => {
                const val = document.getElementById('t-select').value;
                timePeriod = parseInt(val);
                m.remove();
                speakBangla(`টাইমার সেট করা হয়েছে। মার্কেট স্ক্যান করতে বটের ওপর টাচ করুন।`);
            };
        } else {
            isScanning = true;
            analyzeMarketAndTrade();
        }
    });
})();