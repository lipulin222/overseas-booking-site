/* ===========================================
   外籍就医Demo - JavaScript
   交互逻辑：导航、滚动、表单等
   =========================================== */

(function () {
  "use strict";

  /* ---------- 头部滚动效果 ---------- */
  const header = document.getElementById("header");
  const backToTop = document.getElementById("backToTop");

  function onScroll() {
    const scrolled = window.scrollY > 20;

    if (header) {
      header.classList.toggle("is-scrolled", scrolled);
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 600);
    }

    updateActiveNav();
  }

  /* ---------- 移动端导航 ---------- */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // 点击导航链接后关闭菜单
    nav.querySelectorAll(".nav__link").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 当前激活的导航项 ---------- */
  const navLinks = document.querySelectorAll(".nav__link");
  const sections = document.querySelectorAll("section[id]");

  function updateActiveNav() {
    if (!sections.length || !navLinks.length) return;

    let currentId = "";
    const offset = 120;

    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= offset && rect.bottom > offset) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      link.classList.toggle("active", href === "#" + currentId);
    });
  }

  /* ---------- 滚动出现动画 ---------- */
  const revealTargets = [
    ".service-card",
    ".city-card",
    ".about__content",
    ".insurance__content",
    ".contact__info",
    ".section__head",
  ];

  const revealEls = document.querySelectorAll(revealTargets.join(","));

  revealEls.forEach(function (el, index) {
    el.classList.add("reveal");
    // 给同组元素添加延迟，形成依次出现的效果
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(function (c) {
        return c.classList.contains("reveal");
      });
      const idx = siblings.indexOf(el);
      if (idx >= 0 && idx < 4) {
        el.setAttribute("data-delay", String(idx + 1));
      }
    }
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    // 降级处理：直接显示
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- 语言切换（demo） ---------- */
  const langList = [
    { code: "zh", label: "中文" },
    { code: "en", label: "EN" },
    { code: "ja", label: "日本語" },
  ];
  let langIdx = 0;

  const langSwitch = document.getElementById("langSwitch");
  const langCurrent = document.querySelector(".top-bar__current strong");

  function updateLang() {
    if (langCurrent) langCurrent.textContent = langList[langIdx].label;
  }

  if (langSwitch) {
    langSwitch.addEventListener("click", function () {
      langIdx = (langIdx + 1) % langList.length;
      updateLang();
      if (window.__applyLang) window.__applyLang(langList[langIdx].code);
      window.dispatchEvent(new Event("langchange"));
    });
  }
  // 初始应用当前语言
  if (window.__applyLang) window.__applyLang(langList[langIdx].code);
  updateLang();

  /* ---------- 轮播图 ---------- */
  (function initCarousel() {
    const track = document.getElementById("carouselTrack");
    const prevBtn = document.getElementById("carouselPrev");
    const nextBtn = document.getElementById("carouselNext");
    const dotsContainer = document.getElementById("carouselDots");
    const carouselText = document.getElementById("carouselText");

    if (!track) return;

    // 初始化 transform，避免首次切换瞬移
    track.style.transform = "translateX(0%)";

    const slides = Array.from(track.querySelectorAll(".hero-carousel__slide"));
    const total = slides.length;
    let current = 0;
    let timer = null;
    const INTERVAL = 5000;

    // 7 条文案数据
    const texts = [
      { num: "01", title: "专业认证的医疗资质", desc: "所有合作医生均持有正规执业资格，诊所通过国际医疗质量认证，让您安心就诊。" },
      { num: "02", title: "循证医学为基础的诊疗", desc: "严格遵循国际临床指南，以最新循证医学证据为诊疗依据，拒绝过度医疗。" },
      { num: "03", title: "坚持高性价比的优质服务", desc: "合理透明的收费标准，让您以公道价格享受国际水准的医疗服务。" },
      { num: "04", title: "AI陪诊解决语言障碍", desc: "智能 AI 翻译全程陪同就诊，实时多语种沟通，让外籍患者就医无忧。" },
      { num: "05", title: "支持国际信用卡支付体系", desc: "支持 Visa、Mastercard 等主流国际信用卡，结算便捷，账单清晰可查。" },
      { num: "06", title: "支持对接国际商业保险", desc: "与全球主要商业医疗保险公司直付合作，就诊免垫付，流程更顺心。" },
      { num: "07", title: "提供多语言医疗文书", desc: "诊断报告、处方、病历均可输出中英日韩多语种版本，方便跨境就医与保险理赔。" },
    ];

    // 为每张 slide 设置 tabpanel 语义
    slides.forEach(function (slide, i) {
      slide.setAttribute("role", "tabpanel");
      slide.setAttribute("id", "carousel-slide-" + i);
      slide.setAttribute("aria-label", "第 " + (i + 1) + " 张");
    });

    // 生成指示点
    slides.forEach(function (_, i) {
      const dot = document.createElement("button");
      dot.className = "hero-carousel__dot";
      dot.setAttribute("type", "button");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "切换到第 " + (i + 1) + " 张");
      dot.setAttribute("aria-controls", "carousel-slide-" + i);
      dot.setAttribute("aria-selected", "false");
      dot.addEventListener("click", function () {
        goTo(i);
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function updateText(index) {
      if (!carouselText) return;
      const t = window.__t ? window.__t("carousel." + (index + 1) + ".title") : texts[index].title;
      const d = window.__t ? window.__t("carousel." + (index + 1) + ".desc") : texts[index].desc;
      carouselText.classList.remove("is-switching");
      // 强制重绘以重新触发动画
      void carouselText.offsetWidth;
      carouselText.classList.add("is-switching");
      carouselText.querySelector(".hero-integrated__overlay-title").textContent = t;
      carouselText.querySelector(".hero-integrated__overlay-desc").textContent = d;
    }

    // 语言切换时刷新轮播文案
    window.addEventListener("langchange", function () { updateText(current); });

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = "translateX(-" + current * 100 + "%)";

      slides.forEach(function (s, i) {
        s.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (d, i) {
        const active = i === current;
        d.classList.toggle("is-active", active);
        d.setAttribute("aria-selected", String(active));
      });
      updateText(current);
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function startTimer() {
      timer = setInterval(next, INTERVAL);
    }

    function resetTimer() {
      if (timer) clearInterval(timer);
      startTimer();
    }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); resetTimer(); });

    // 鼠标悬停时暂停
    const carousel = document.querySelector(".hero-integrated");
    if (carousel) {
      carousel.addEventListener("mouseenter", function () {
        if (timer) clearInterval(timer);
      });
      carousel.addEventListener("mouseleave", function () {
        startTimer();
      });

      // 触摸滑动支持
      let touchStartX = 0;
      let touchEndX = 0;
      carousel.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      carousel.addEventListener("touchend", function (e) {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) next();
          else prev();
          resetTimer();
        }
      }, { passive: true });
    }

    // 键盘左右键支持
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { prev(); resetTimer(); }
      else if (e.key === "ArrowRight") { next(); resetTimer(); }
    });

    // 初始化
    goTo(0);
    startTimer();
  })();

  /* ---------- 多步骤问卷弹窗 ---------- */
  (function initQuiz() {
    // i18n 文本辅助函数（整个问卷/方案 IIFE 共享）
    function _T(k, v) { return window.__t ? window.__t(k, v) : ""; }

    // 记录 AI 方案页当前渲染模式，用于切换语言时自动重渲染
    let planMode = "aiplan";
    let lastProjects = null;
    // 医美"了解更多"最近一次勾选的项目键（语言切换重渲染时 DOM 已清空，用此缓存恢复）
    let lastLearnProjectKeys = null;
    let lastDoctors = null;
    let currentDept = "beauty"; // 当前科室：beauty / dental / pediatric / checkup

    // 各科室医生头像（与 appendDoctors 的 doc1/2/3 顺序一致）
    // 注意：体检科室不推荐医生，故未配置 checkup 项
    var DEPT_DOC_IMGS = {
      dental:    ["pic/doctor-female-1.png", "pic/doctor-male-1.png", "pic/doctor-female-2.png"],
      pediatric: ["pic/doctor-female-2.png", "pic/doctor-female-3.png", "pic/doctor-female-4.png"],
      beauty:    ["pic/doctor.png",          "pic/doctor.png",          "pic/doctor.png"]
    };
    function deptDocImgs() {
      return DEPT_DOC_IMGS[currentDept] || DEPT_DOC_IMGS.beauty;
    }

    // 根据 Q4 答案识别科室
    function detectDept(q4text) {
      const t = (q4text || "").toLowerCase();
      if (t.indexOf("齿科") !== -1 || t.indexOf("dental") !== -1 || t.indexOf("歯科") !== -1) return "dental";
      if (t.indexOf("儿科") !== -1 || t.indexOf("儿童") !== -1 || t.indexOf("pediatric") !== -1 || t.indexOf("小児") !== -1) return "pediatric";
      if (t.indexOf("体检") !== -1 || t.indexOf("checkup") !== -1 || t.indexOf("健診") !== -1 || t.indexOf("健诊") !== -1) return "checkup";
      return "beauty";
    }

    // 根据 Q5 答案识别城市
    function detectCity(q5text) {
      const t = (q5text || "").toLowerCase();
      if (t.indexOf("北京") !== -1 || t.indexOf("beijing") !== -1) return "bj";
      if (t.indexOf("广州") !== -1 || t.indexOf("広州") !== -1 || t.indexOf("guangzhou") !== -1) return "gz";
      if (t.indexOf("深圳") !== -1 || t.indexOf("shenzhen") !== -1) return "sz";
      if (t.indexOf("杭州") !== -1 || t.indexOf("hangzhou") !== -1) return "hz";
      if (t.indexOf("苏州") !== -1 || t.indexOf("suzhou") !== -1) return "ot";
      return "sh"; // 上海为默认
    }

    // 按科室取 i18n 键（医美用 ap.*，其它用 ap.dn.* / ap.pd.* / ap.hc.*）
    // 注意：i18n 字典前缀用缩写 dn/pd/hc，需做映射；若科室专属键缺失则回退到医美通用文案 ap.*
    var DEPT_PREFIX = { dental: "dn", pediatric: "pd", checkup: "hc" };
    function deptT(suffix, vars) {
      if (currentDept === "beauty") return _T("ap." + suffix, vars);
      var prefix = DEPT_PREFIX[currentDept] || currentDept;
      var v = _T("ap." + prefix + "." + suffix, vars);
      if (v !== undefined && v !== null && v !== "") return v;
      return _T("ap." + suffix, vars);
    }

    // ---------- 货币：根据用户国家显示对应货币 ----------
    var COUNTRY_CURRENCY = [
      { keys: ["美国", "United States", "アメリカ"], ccy: "usd" },
      { keys: ["欧元区", "德国", "法国", "意大利", "西班牙", "荷兰", "Eurozone", "Germany", "France", "Italy", "Spain", "Netherlands", "ドイツ", "フランス", "イタリア"], ccy: "eur" },
      { keys: ["英国", "United Kingdom", "イギリス"], ccy: "usd" }, // GBP 未 cover，退 USD
      { keys: ["日本", "Japan", "日本国", "日本国籍", "日本居住"], ccy: "jpy" },
      { keys: ["韩国", "Korea", "South Korea", "韓国"], ccy: "krw" },
      { keys: ["新加坡", "Singapore", "シンガポール"], ccy: "sgd" },
      { keys: ["泰国", "Thailand", "タイ"], ccy: "thb" },
      { keys: ["马来西亚", "Malaysia", "マレーシア"], ccy: "myr" },
      { keys: ["\u5370\u5ea6", "India", "\u30a4\u30f3\u30c9"], ccy: "inr" },
      { keys: ["阿联酋", "迪拜", "UAE", "Dubai", "UAE居住", "アラブ首長国"], ccy: "aed" },
      { keys: ["沙特", "Saudi", "サウジ"], ccy: "sar" }
    ];
    function detectCurrency(country) {
      if (!country) return null;
      var s = String(country);
      for (var i = 0; i < COUNTRY_CURRENCY.length; i++) {
        var ks = COUNTRY_CURRENCY[i].keys;
        for (var j = 0; j < ks.length; j++) { if (s.indexOf(ks[j]) !== -1) return COUNTRY_CURRENCY[i].ccy; }
      }
      return null;
    }
    function getCurrencyFromQ1() {
      var q1 = answers[1] || "";
      // Q1 可能是"海外他国居民 - 美国"等格式
      var parts = String(q1).split(/[-—–]/);
      var joined = parts.join("|");
      return detectCurrency(joined) || detectCurrency(q1);
    }
    // 格式化价格区间：解析原价格文本中的 ¥min–max，按用户货币换算
    // 输入形如 "¥600–1200/单次（约€78–155）" 或 "¥2,500–3,200/session (≈€325–415)"
    function formatPrice(text) {
      if (!text || typeof text !== "string") return text;
      var ccy = getCurrencyFromQ1();
      // 中国用户无需换算；欧元区用户保留原文中已含的 € 参考
      if (!ccy || ccy === "eur") return text;
      // 兼容千位分隔符：¥2,500–3,200
      var m = text.match(/¥([\d,]+)[–\-~—]([\d,]+)/);
      if (!m) return text;
      var min = parseInt(m[1].replace(/,/g, ""), 10);
      var max = parseInt(m[2].replace(/,/g, ""), 10);
      var rate = parseFloat(_T("fx.rate." + ccy)) || 0;
      if (!rate) return text;
      var sym = _T("fx.sym." + ccy) || "";
      var v1 = Math.round(min * rate);
      var v2 = Math.round(max * rate);
      // 千位分隔
      var sep = function (n) {
        if (ccy === "krw" || ccy === "jpy") return String(n);
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };
      // 移除原文中硬编码的欧元换算尾巴（中文/英文/日文括号或竖线格式），
      // 避免非欧元区用户（如马来西亚 RM）看到"还是欧元"
      var cleaned = text
        .replace(/[（(][^（()）]*€[^（()）]*[)）]/g, "")
        .replace(/\s*[|｜]\s*€[\d,，\s–\-~—]+/g, "")
        .trim();
      if (cleaned.indexOf("€") === -1) {
        return cleaned + "（≈" + sym + sep(v1) + "–" + sep(v2) + "）";
      }
      return cleaned + " / " + sym + sep(v1) + "–" + sep(v2);
    }
    // 包装 deptT：对价格类后缀自动格式化
    var PRICE_SUFFIX = /^(proj[A-C]\dPrice|proj\dPrice|beauty\dPrice|g\d_\d|noteSel|bn1Name|bn2Name|bn3Name)$/;
    function deptTX(suffix, vars) {
      var raw = deptT(suffix, vars);
      if (PRICE_SUFFIX.test(suffix)) return formatPrice(raw);
      return raw;
    }

    // 追问选项（A/B/C）→ 9 项目卡片键集合（对应 projA1..projC3）
    // 每科室 3 大方向 × 3 个项目 = 9 个项目卡，用户点 A/B/C 后按方向展示对应 3 个项目
    var CHOICE_SUB_PROJ = {
      dental:    { A: ["A1", "A2", "A3"], B: ["B1", "B2", "B3"], C: ["C1", "C2", "C3"] },
      pediatric: { A: ["A1", "A2", "A3"], B: ["B1", "B2", "B3"], C: ["C1", "C2", "C3"] },
      checkup:   { A: ["A1", "A2", "A3"], B: ["B1", "B2", "B3"], C: ["C1", "C2", "C3"] },
      beauty:    { A: ["A1", "A2", "A3"], B: ["B1", "B2", "B3"], C: ["C1", "C2", "C3"] }
    };

    const quiz = document.getElementById("quiz");
    const modal = document.getElementById("quizModal");
    if (!quiz || !modal) return;

    const steps = Array.from(quiz.querySelectorAll(".quiz__step"));
    const total = steps.length;
    let current = 1;

    const progressBar = document.getElementById("quizProgressBar");
    const progressText = document.getElementById("quizProgressText");
    const prevBtn = document.getElementById("quizPrev");
    const nextBtn = document.getElementById("quizNext");
    const submitBtn = document.getElementById("quizSubmit");
    const aiPlanEl = document.getElementById("quizAiPlan");
    const aiPlanBody = document.getElementById("aiPlanBody");
    const aiPlanConfirm = document.getElementById("aiPlanConfirm");
    const aiPlanPicked = document.getElementById("aiPlanPicked");
    const aiPlanInput = document.getElementById("aiPlanInput");
    const aiPlanSend = document.getElementById("aiPlanSend");
    const q1SubOptions = document.getElementById("q1SubOptions");
    const q1CountrySelect = document.getElementById("q1CountrySelect");
    const calUndecidedBtn = document.getElementById("calUndecided");
    let calRender = null; // 由日历 IIFE 设置

    // 记录每步选择
    const answers = {};

    // ---------- 重置问卷到初始状态 ----------
    function resetQuiz() {
      current = 1;
      Object.keys(answers).forEach(function (k) { delete answers[k]; });
      quiz.querySelectorAll(".quiz__option, .quiz__sub-option, .quiz__quick-country").forEach(function (o) {
        o.classList.remove("is-selected");
      });
      quiz.querySelectorAll("input").forEach(function (i) { i.value = ""; });
      if (q1SubOptions) q1SubOptions.hidden = true;
      if (q1CountrySelect) q1CountrySelect.value = "";
      // 重置日历选中
      if (calUndecidedBtn) calUndecidedBtn.classList.remove("is-selected");
      if (typeof calRender === "function") calRender();
      // 显示问卷区，隐藏方案页
      quiz.style.display = "";
      if (aiPlanEl) aiPlanEl.hidden = true;
      updateUI();
    }

    // ---------- 弹窗开关 ----------
    // 每次打开都呼起全新问卷流程
    // 页面上的"立即预约"/预约助手气泡每次都打开全新问卷，不再恢复上次记录。
    function openModal() {
      resetQuiz();
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    // 暴露给右下角预约助手气泡调用：总是打开全新问卷让用户填写
    window.__openQuizModal = function () { openModal(); };

    // 切换语言时，若 AI 方案页正在展示，用当前语言重渲染其内容
    document.addEventListener("langchange", function () {
      if (aiPlanEl && !aiPlanEl.hidden && aiPlanBody) {
        aiPlanBody.innerHTML = "";
        if (planMode === "book" && lastProjects) {
          renderBookingReply(lastProjects, lastDoctors);
        } else if (planMode === "learn" && lastProjects) {
          renderLearnReply(lastProjects, lastDoctors);
        } else if (planMode === "more") {
          renderMoreOptions();
        } else {
          renderAiPlan();
        }
        aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
      }
    });

    const openBtns = [
      document.getElementById("openQuizBtn"),
      document.getElementById("openQuizBtnHero"),
      document.getElementById("headerRegBtn"),
    ];
    openBtns.forEach(function (b) {
      if (b) b.addEventListener("click", function () { openModal(false); });
    });

    const closeBtn = document.getElementById("quizClose");
    const overlay = document.getElementById("quizOverlay");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });

    // ---------- 检查 step 是否完成 ----------
    function isStepComplete(stepNum) {
      if (stepNum === 8) {
        const nameEl = quiz.querySelector("[name='quiz_name']");
        // 手机号改为选填，仅姓名必填
        return nameEl && nameEl.value.trim();
      }
      if (stepNum === 1) {
        // Q1: 海外居民需要选国家；中国境内直接完成
        return !!answers[1];
      }
      return !!answers[stepNum];
    }

    function updateUI() {
      steps.forEach(function (s) {
        s.classList.toggle("is-active", Number(s.dataset.step) === current);
      });

      const pct = (current / total) * 100;
      if (progressBar) progressBar.style.width = pct + "%";
      if (progressText) progressText.textContent = window.__t
        ? window.__t("quiz.progress", { current: current, total: total })
        : "第 " + current + " 步 / 共 " + total + " 步";

      if (prevBtn) prevBtn.disabled = current === 1;

      // 第 8 步：只显示"上一步"和"提交预约"（不显示"下一步"）
      // "提交预约"按钮根据必填项填写情况显示/隐藏
      if (current === total) {
        if (nextBtn) nextBtn.hidden = true;
        if (submitBtn) submitBtn.hidden = false;
      } else {
        if (nextBtn) nextBtn.hidden = false;
        if (submitBtn) submitBtn.hidden = true;
      }
    }

    // 语言切换时刷新进度文案
    window.addEventListener("langchange", function () { updateUI(); });

    // ---------- 选项点击（通用） ----------
    steps.forEach(function (step) {
      const stepNum = Number(step.dataset.step);
      const options = step.querySelectorAll(".quiz__option");
      options.forEach(function (opt) {
        opt.addEventListener("click", function () {
          // Q1 特殊处理
          if (stepNum === 1) {
            options.forEach(function (o) { o.classList.remove("is-selected"); });
            opt.classList.add("is-selected");
            const subOptions = document.getElementById("q1SubOptions");

            if (opt.dataset.q1 === "overseas") {
              // 海外居民：展开国家选择，不自动跳下一步
              if (subOptions) subOptions.hidden = false;
              answers[1] = undefined; // 等选完国家才算完成
              return;
            } else {
              // 中国境内常住：直接完成
              if (subOptions) subOptions.hidden = true;
              answers[1] = opt.textContent.trim();
              // 清空子选项选中状态
              if (subOptions) {
                subOptions.querySelectorAll(".quiz__sub-option").forEach(function (o) {
                  o.classList.remove("is-selected");
                });
              }
              setTimeout(function () {
                if (current < total) { current++; updateUI(); }
              }, 250);
              return;
            }
          }

          // 其他步骤：选中后自动跳下一步
          options.forEach(function (o) { o.classList.remove("is-selected"); });
          opt.classList.add("is-selected");
          answers[stepNum] = opt.textContent.trim();
          setTimeout(function () {
            if (current < total) { current++; updateUI(); }
          }, 250);
        });
      });
    });

    // ---------- Q1 子选项（国家/地区选择） ----------
    if (q1SubOptions) {
      // 下拉选择器
      if (q1CountrySelect) {
        q1CountrySelect.addEventListener("change", function () {
          if (q1CountrySelect.value) {
            answers[1] = "海外他国居民 - " + q1CountrySelect.value;
            // 清除快捷按钮选中状态
            q1SubOptions.querySelectorAll(".quiz__quick-country").forEach(function (o) {
              o.classList.remove("is-selected");
            });
            setTimeout(function () {
              if (current < total) { current++; updateUI(); }
            }, 250);
          }
        });
      }
      // 快捷国家按钮
      q1SubOptions.querySelectorAll(".quiz__quick-country").forEach(function (opt) {
        opt.addEventListener("click", function () {
          q1SubOptions.querySelectorAll(".quiz__quick-country").forEach(function (o) {
            o.classList.remove("is-selected");
          });
          opt.classList.add("is-selected");
          // 同步到下拉选择器
          if (q1CountrySelect) q1CountrySelect.value = opt.textContent.trim();
          answers[1] = "海外他国居民 - " + opt.textContent.trim();
          setTimeout(function () {
            if (current < total) { current++; updateUI(); }
          }, 250);
        });
      });
    }

    // ---------- 上一步 ----------
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (current > 1) { current--; updateUI(); }
      });
    }

    // ---------- 下一步 ----------
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (!isStepComplete(current)) {
          showToast(window.__t ? window.__t(current === 1 ? "toast.q1" : "toast.q") : (current === 1 ? "请选择您的国籍或所在地" : "请先选择一个选项"));
          return;
        }
        if (current < total) { current++; updateUI(); }
      });
    }

    // ---------- 提交 ----------
    if (submitBtn) {
      submitBtn.addEventListener("click", function () {
        const nameEl = quiz.querySelector("[name='quiz_name']");
        const phoneEl = quiz.querySelector("[name='quiz_phone']");

        if (!nameEl.value.trim()) {
          nameEl.focus();
          showToast(window.__t ? window.__t("toast.name") : "请填写您的姓名");
          return;
        }

        // 手机号选填，不做强制校验

        // 保存就诊记录到右下角 AI 机器人
        if (window.__addMedicalRecord) {
          const country = answers[1] ? answers[1].replace("海外他国居民 - ", "").replace("中国境内常住（持有居留许可）", "中国境内常住") : "海外";
          const entry = answers[2] || "免签入境";
          const city = answers[5] || "上海";
          const date = answers[6] || "暂未确定";
          const now = new Date();
          const pad = function (n) { return n < 10 ? "0" + n : "" + n; };
          window.__addMedicalRecord({
            time: now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()),
            name: nameEl.value.trim(),
            summary: country + "国籍 · " + entry + " · " + city + " · " + date,
            intent: "",
            // 同步保存问卷答案 + 姓名（供 AI 气泡再次点击时复用）
            answers: JSON.parse(JSON.stringify(answers)),
          });
          // 通知气泡旁的 agent 总结浮层展示
          if (window.__showBubbleCard) {
            // 日期去掉年份，如 "2026年8月30日" → "8月30日"
            const shortDate = String(date || "").replace(/^\d{4}年/, "");
            window.__showBubbleCard({
              summary: country + "国籍 · " + entry + " · " + city + " · " + shortDate
            });
          }
        }

        // 提交预约后，将表单推送到钉钉机器人（私发给指定接收人）
        try {
          const emailEl = quiz.querySelector("[name='quiz_email']");
          let project = answers[4];
          if (Array.isArray(project)) project = project.join("、");
          const nowDt = new Date();
          const pad2 = function (n) { return n < 10 ? "0" + n : "" + n; };
          const submitTime = nowDt.getFullYear() + "-" + pad2(nowDt.getMonth() + 1) + "-" + pad2(nowDt.getDate()) + " " + pad2(nowDt.getHours()) + ":" + pad2(nowDt.getMinutes());
          if (window.pushBookingToDingTalk) {
            window.pushBookingToDingTalk({
              name: nameEl.value.trim(),
              phone: phoneEl && phoneEl.value ? phoneEl.value.trim() : "",
              email: emailEl && emailEl.value ? emailEl.value.trim() : "",
              country: (answers[1] || "").replace("海外他国居民 - ", "").replace("中国境内常住（持有居留许可）", "中国境内常住"),
              entry: answers[2] || "",
              stay: answers[3] || "",
              project: project || "",
              city: answers[5] || "",
              date: answers[6] || "",
              contact: answers[7] || "",
              time: submitTime
            });
          }
        } catch (e) {
          console.warn("钉钉推送异常：", e);
        }

        // 提交后直接进入 AI 方案页（无中转过渡）
        quiz.style.display = "none";
        if (aiPlanEl) aiPlanEl.hidden = false;
        renderAiPlan();
      });
    }

    // ---------- 预约助手：展示就诊方案（项目介绍 / 医生介绍）+ 重新填写问卷按钮（无互动问答） ----------
    function renderAiPlan() {
      if (!aiPlanBody) return;
      planMode = "aiplan";

      // 识别科室
      currentDept = detectDept(answers[4]);

      // 读取用户填写的关键信息
      const nameEl = quiz.querySelector("[name='quiz_name']");
      const userName = nameEl ? nameEl.value.trim() : "用户";

      // Q1 国籍/所在地
      const country = answers[1] ? answers[1].replace("海外他国居民 - ", "").replace("中国境内常住（持有居留许可）", "中国境内常住") : "海外";
      // Q2 入境方式
      const entry = answers[2] || "免签入境";
      // Q5 城市
      const city = answers[5] || "上海";
      // Q6 日期
      const date = answers[6] || "暂未确定";
      // 城市 key（用于诊所库）
      const cityKey = detectCity(city);

      const _T = function (k, v) { return window.__t ? window.__t(k, v) : ""; };
      aiPlanBody.innerHTML = [
        // 开场问候
        '<div class="ai-plan__msg">',
        '  <p>' + deptT("greet", { name: userName, country: country, entry: entry, city: city, date: date }) + '</p>',
        '</div>',

        // 合规说明
        '<div class="ai-plan__block">',
        '  <h4>' + deptT("complianceTitle") + '</h4>',
        '  <p>' + deptT("complianceText", { entry: entry }) + '</p>',
        '</div>',

        // 项目介绍（分类清单）
        '<div class="ai-plan__block">',
        '  <h4>' + deptT("projectsTitle") + '</h4>',
        '  <div class="ai-plan__group">',
        '    <h5>' + deptT("group1Title") + '</h5>',
        '    <ul>',
        '      <li>' + deptTX("g1_1") + '</li>',
        '      <li>' + deptTX("g1_2") + '</li>',
        '      <li>' + deptTX("g1_3") + '</li>',
        '    </ul>',
        '  </div>',
        '  <div class="ai-plan__group">',
        '    <h5>' + deptT("group2Title") + '</h5>',
        '    <ul>',
        '      <li>' + deptTX("g2_1") + '</li>',
        '      <li>' + deptTX("g2_2") + '</li>',
        '    </ul>',
        '  </div>',
        '  <div class="ai-plan__group">',
        '    <h5>' + deptT("group3Title") + '</h5>',
        '    <ul>',
        '      <li>' + deptTX("g3_1") + '</li>',
        '      <li>' + deptTX("g3_2") + '</li>',
        '    </ul>',
        '  </div>',
        '</div>',

        // 诊所推荐
        '<div class="ai-plan__block">',
        '  <h4>' + deptT("clinicTitle") + '</h4>',
        '  <p>' + deptT("clinicIntro", { city: city }) + '</p>',
        '  <div class="ai-plan__clinic">',
        '    <strong>' + _T("clinic." + cityKey + ".1.name") + '</strong>',
        '    <p>' + _T("clinic." + cityKey + ".1.addr") + '</p>',
        '    <p>' + _T("clinic." + cityKey + ".1.adv") + '</p>',
        '  </div>',
        '  <div class="ai-plan__clinic">',
        '    <strong>' + _T("clinic." + cityKey + ".2.name") + '</strong>',
        '    <p>' + _T("clinic." + cityKey + ".2.addr") + '</p>',
        '    <p>' + _T("clinic." + cityKey + ".2.adv") + '</p>',
        '  </div>',
        '</div>',
      ].join("");

      // 项目介绍卡片（按当前科室默认展示）
      const map = CHOICE_SUB_PROJ[currentDept] || CHOICE_SUB_PROJ.beauty;
      appendProjects(map.A || map.B || map.C || ["A1", "A2", "A3"]);

      // 医生介绍（体检科室不展示医生）
      if (currentDept !== "checkup") {
        appendDoctors();
      }

      // 底部：重新填写问卷按钮（替代原 A/B/C 互动追问）
      appendRestartRow();
    }

    // 追加"重新填写问卷"按钮行
    function appendRestartRow() {
      if (!aiPlanBody) return;
      const row = document.createElement("div");
      row.className = "ai-plan__restart-row";
      row.innerHTML = '<button type="button" class="ai-plan__restart-btn" id="aiPlanRestartBtn">' + ((window.__t && window.__t("aiplan.restart")) || "重新填写问卷") + '</button>' +
        '<p class="ai-plan__restart-tip">' + ((window.__t && window.__t("aiplan.restartTip")) || "重新提交问卷后，以上信息将被覆盖。") + '</p>';
      aiPlanBody.appendChild(row);
      const restartBtn = document.getElementById("aiPlanRestartBtn");
      if (restartBtn) {
        restartBtn.addEventListener("click", function () {
          // 清空本地最近一条就诊记录，避免下次再点气泡时仍恢复旧数据
          if (window.__clearLastMedicalRecord) {
            window.__clearLastMedicalRecord();
          } else {
            try { localStorage.removeItem("zhuozheng_medical_history"); } catch (e) { /* ignore */ }
          }
          // 切换到全新问卷视图（方案视图关闭，问卷弹窗自动打开）
          resetQuiz();
          // 确保 modal 处于打开状态
          if (modal) {
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
          }
        });
      }
    }

    // 追加消息气泡（一次性显示完整内容，不再使用流式打字效果）
    function appendMessage(role, text) {
      if (!aiPlanBody) return;
      const msg = document.createElement("div");
      msg.className = "ai-plan__msg ai-plan__msg--" + role;
      const para = document.createElement("p");
      msg.appendChild(para);
      aiPlanBody.appendChild(msg);

      // 解析 markdown 加粗和换行后一次性渲染
      const html = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
      para.innerHTML = html;
      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // ---------- 通用：三选项（已确定/再了解/换其他） ----------
    // 在多个完成节点（确认选择、了解详情、其他项目等）之后追加同样的三个动作，
    // 让"了解 → 再了解 → 再换其他"能形成完整循环，不再卡死。
    // from="learn" 时省略"再了解"按钮（详情已看完，避免死循环重看同样内容）。
    function appendPostActionOptions(checkedProjects, checkedDoctors, from) {
      if (!aiPlanBody) return;
      appendMessage("bot", _T("ap.confirmAsk"));

      const wrap = document.createElement("div");
      wrap.className = "ai-plan__followups";
      var btns = [
        '<button type="button" class="ai-plan__followup" data-action="book">' + _T("ap.followBook") + '</button>',
      ];
      if (from !== "learn") {
        btns.push('<button type="button" class="ai-plan__followup" data-action="learn">' + _T("ap.followLearn") + '</button>');
      }
      btns.push('<button type="button" class="ai-plan__followup" data-action="more">' + _T("ap.followMore") + '</button>');
      wrap.innerHTML = btns.join("");
      aiPlanBody.appendChild(wrap);

      wrap.querySelectorAll(".ai-plan__followup").forEach(function (btn) {
        btn.addEventListener("click", function () {
          wrap.querySelectorAll(".ai-plan__followup").forEach(function (b) { b.disabled = true; });
          btn.classList.add("is-selected");
          appendMessage("user", btn.textContent);
          aiPlanBody.scrollTop = aiPlanBody.scrollHeight;

          setTimeout(function () {
            if (btn.dataset.action === "book") {
              renderBookingReply(checkedProjects || [], checkedDoctors || []);
            } else if (btn.dataset.action === "learn") {
              renderLearnReply(checkedProjects || [], checkedDoctors || []);
            } else {
              renderMoreOptions();
            }
            aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
          }, 500);
        });
      });

      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // ---------- 选项1：预约流程指引（富内容：按钮 + 就诊信息卡片 + 二维码） ----------
    function renderBookingReply(projects, doctors) {
      if (!aiPlanBody) return;
      planMode = "book";
      lastProjects = projects;
      lastDoctors = doctors;

      // 用户信息
      const nameEl = quiz.querySelector("[name='quiz_name']");
      const userName = nameEl ? nameEl.value.trim() : "用户";

      // 项目、医生、诊所（从勾选数据提取；缺省按当前科室代表性项目；体检无医生则留空）
      const isCheckup = currentDept === "checkup";
      const projectName = (projects && projects.length > 0) ? projects[0] : deptT("projA1Name");
      const doctorFull = (doctors && doctors.length > 0)
        ? doctors[0]
        : (isCheckup ? "" : deptT("doc1Name"));
      const doctorName = doctorFull ? doctorFull.split("｜")[0].trim() : "";
      const clinicName = (doctorFull && doctorFull.indexOf("｜") > -1)
        ? doctorFull.split("｜")[1].trim()
        : _T("clinic." + detectCity(answers[5] || "上海") + ".1.name").replace(/^\d+\.\s*/, "").replace(/（首推）|（备选）|（就近推荐）/g, "");
      // 用于 bookGreet 占位符：体检无医生时显示占位横线，避免文案出现"医生：｜诊所"
      const doctorDisplay = doctorName || "——";

      // 就诊日期（问卷第6步）
      const rawDate = answers[6] || "暂未确定";
      const dateCn = rawDate;
      const dateCompact = rawDate !== "暂未确定" ? rawDate.replace("年", ".").replace("月", ".").replace("日", "") : "待定";

      // 开场气泡
      appendMessage("bot", _T("ap.bookGreet", { project: projectName, doctor: doctorDisplay, clinic: clinicName, date: dateCompact }));

      // 主体富内容气泡（步骤卡片）
      const wrap = document.createElement("div");
      wrap.className = "ai-plan__msg ai-plan__msg--bot ai-plan__rich";
      wrap.innerHTML = [
        // 第一步
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">1</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.bk1Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.bk1p1") + '</p>',
        '    <p>' + _T("ap.bk1p2") + '</p>',
        '    <p>' + _T("ap.bk1p3") + '</p>',
        '    <button type="button" class="ai-plan__book-btn" data-act="register">' + _T("ap.bkRegister") + '</button>',
        '  </div>',
        '</div>',
        // 第二步
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">2</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.bk2Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.bk2p1") + '</p>',
        '    <button type="button" class="ai-plan__book-btn" data-act="download">' + _T("ap.bkDownload") + '</button>',
        '  </div>',
        '</div>',
        // 第三步
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">3</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.bk3Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.bk3p1") + '</p>',
        '    <p>' + _T("ap.bk3p2") + '</p>',
        '    <div class="ai-plan__spec">',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.bkSpecPatient") + '</span><span class="ai-plan__spec-value">' + userName + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.bkSpecClinic") + '</span><span class="ai-plan__spec-value">' + clinicName + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.bkSpecDept") + '</span><span class="ai-plan__spec-value">' + deptT("bkDeptValue") + '</span></div>',
        (doctorName ? '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.bkSpecDoctor") + '</span><span class="ai-plan__spec-value">' + doctorName + '</span></div>' : ''),
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.bkSpecDate") + '</span><span class="ai-plan__spec-value">' + dateCn + '</span></div>',
        '    </div>',
        '  </div>',
        '</div>',
        // 第四步
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">4</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.bk4Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.bk4p1") + '</p>',
        '    <ul class="ai-plan__points">',
        '      <li>' + _T("ap.bk4li1") + '</li>',
        '      <li>' + _T("ap.bk4li2") + '</li>',
        '    </ul>',
        '  </div>',
        '</div>',
        // 第五步
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">5</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.bk5Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.bk5p1", { date: dateCn, clinic: clinicName }) + '</p>',
        '  </div>',
        '</div>',
        '<p>' + _T("ap.bkWechatTip") + '</p>',
        '<div class="ai-plan__contact-card">',
        '  <p>' + _T("ap.bkContactTitle") + '</p>',
        '  <div class="ai-plan__qrcode"></div>',
        '  <p>' + _T("ap.bkEmail") + '</p>',
        '  <p>' + _T("ap.bkHotline") + '</p>',
        '</div>',
        '<p>' + _T("ap.bkThanks") + '</p>'
      ].join("");
      aiPlanBody.appendChild(wrap);

      // 按钮交互
      wrap.querySelectorAll(".ai-plan__book-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (btn.dataset.act === "register") {
            showToast(window.__t ? window.__t("toast.register") : "注册建档功能演示：请使用护照完成实名认证");
          } else {
            showToast(window.__t ? window.__t("toast.download") : "APP下载功能演示：请前往应用商店下载卓正医疗APP");
          }
        });
      });

      // 微信二维码：使用静态图片 pic/codescan.png
      const qrEl = wrap.querySelector(".ai-plan__qrcode");
      if (qrEl) {
        const img = document.createElement("img");
        img.src = "pic/codescan.png";
        img.alt = "微信二维码";
        qrEl.appendChild(img);
      }

      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // ---------- 选项2：产品 / 公司 / 医生详细介绍（富内容卡片 + 图片） ----------
    function renderLearnReply(projects, doctors) {
      if (!aiPlanBody) return;
      planMode = "learn";
      lastProjects = projects;
      lastDoctors = doctors;

      const projectName = (projects && projects.length > 0) ? projects[0] : "润致娃娃针";
      const doctorFull = (doctors && doctors.length > 0) ? doctors[0] : "李晓宁 医生｜静安国际诊所";
      const doctorName = doctorFull.split("｜")[0].trim();

      // 非医美科室：走通用文字版了解更多
      if (currentDept !== "beauty") {
        renderDeptLearnReply(projectName, doctorName);
        return;
      }

      // 医美：读取勾选项目（含 data-key）；语言切换重渲染时 DOM 已清空，回退用缓存
      let learnKeys = [];
      aiPlanBody.querySelectorAll(".ai-plan__block--projects .ai-plan__selectable input[type=checkbox]:checked").forEach(function (cb) {
        const key = cb.getAttribute("data-key") || "";
        if (key) learnKeys.push(key);
      });
      if (learnKeys.length === 0 && lastLearnProjectKeys) learnKeys = lastLearnProjectKeys.slice();
      lastLearnProjectKeys = learnKeys.slice();
      // 润致娃娃针（B2/C1 同一项目，跨方向复用）去重：只要勾选其一即展示一份精美页
      const hasRunzhi = learnKeys.some(function (k) { return k === "B2" || k === "C1"; });
      const otherKeys = learnKeys.filter(function (k) { return k !== "B2" && k !== "C1"; });

      // 开场气泡
      appendMessage("bot", _T("ap.lnGreeting", { project: projectName, doctor: doctorName }));

      // 主体富内容气泡
      const wrap = document.createElement("div");
      wrap.className = "ai-plan__msg ai-plan__msg--bot ai-plan__rich";
      const htmlParts = [];
      // 勾选润致（或未勾选任何项目时兜底展示润致）→ 展示 ap.ln* 精美页
      if (hasRunzhi || learnKeys.length === 0) {
        htmlParts.push(buildRunzhiRichHtml(doctorName));
      }
      // 其余医美项目 → 按勾选展示对应 6 段文字版（品牌/资质/原理/功效/适配/维持）
      // M 开头的键是"更多项目"卡片（M1/M2/M3 → beautyN Learn），其余是主流程项目（A1..C3 → projN Learn）
      otherKeys.forEach(function (k) {
        const learnKey = k.charAt(0) === "M" ? "beauty" + k.slice(1) + "Learn" : "proj" + k + "Learn";
        const desc = deptT(learnKey);
        if (!desc) return;
        const richDesc = desc
          .replace(/品牌[:：]/g, "<strong>品牌：</strong>")
          .replace(/资质[:：]/g, "<strong>资质：</strong>")
          .replace(/原理[:：]/g, "<strong>原理：</strong>")
          .replace(/功效[:：]/g, "<strong>功效：</strong>")
          .replace(/适配[:：]/g, "<strong>适配：</strong>")
          .replace(/维持[:：]/g, "<strong>维持：</strong>");
        htmlParts.push(
          '<div class="ai-plan__section ai-plan__section--learn">',
          '  <div class="ai-plan__section-body ai-plan__learn-body">',
          richDesc,
          '  </div>',
          '</div>'
        );
      });
      wrap.innerHTML = htmlParts.join("") + '<p class="ai-plan__learn-end">' + deptT("lnEnd") + '</p>';
      aiPlanBody.appendChild(wrap);
      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
      // 了解详情后追加选项：详情已展示完，省略"再了解"，避免重复显示同样内容
      appendPostActionOptions(projects, doctors, "learn");
    }

    // 润致娃娃针精美版详情（ap.ln* 系列，B2/C1 复用同一份）
    function buildRunzhiRichHtml(doctorName) {
      return [
        // 一、品牌与公司
        '<div class="ai-plan__section ai-plan__section--accent">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">1</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln1Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.ln1p1") + '</p>',
        '    <div class="ai-plan__media">',
        '      <img src="pic/product.jpg" alt="润致娃娃针产品图" loading="lazy" />',
        '      <div class="ai-plan__media-caption">' + _T("ap.lnCaption") + '</div>',
        '    </div>',
        '  </div>',
        '</div>',
        // 二、产品详情
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">2</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln2Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <div class="ai-plan__spec">',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec1") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec1v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec2") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec2v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec3") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec3v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec4") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec4v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec5") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec5v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec6") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec6v") + '</span></div>',
        '    </div>',
        '    <div class="ai-plan__highlight">' + _T("ap.lnHighlight") + '</div>',
        '    <ul class="ai-plan__points">',
        '      ' + (_T("ap.lnPoints") || []).map(function (p) { return '<li>' + p + '</li>'; }).join(''),
        '    </ul>',
        '    <div class="ai-plan__spec">',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec7") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec7v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec8") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec8v") + '</span></div>',
        '    </div>',
        '  </div>',
        '</div>',
        // 三、医生介绍
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">3</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln3Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.ln3p1", { doctor: doctorName }) + '</p>',
        '    <div class="ai-plan__media">',
        '      <img src="pic/doctor.png" alt="' + doctorName + '医生" loading="lazy" />',
        '      <div class="ai-plan__media-caption">' + _T("ap.lnCaption2", { doctor: doctorName }) + '</div>',
        '    </div>',
        '  </div>',
        '</div>',
        // 四、客观局限
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">4</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln4Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.ln4p1") + '</p>',
        '    <p>' + _T("ap.ln4p2") + '</p>',
        '  </div>',
        '</div>',
        // 五、合规与行程影响
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">5</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln5Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.ln5p1") + '</p>',
        '  </div>',
        '</div>',
        // 六、档期规则
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">6</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln6Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.ln6p1") + '</p>',
        '  </div>',
        '</div>'
      ].join("");
    }

    // ---------- 选项2（科室版）：按勾选项目展开机制/作用/适用范围 ----------
    function renderDeptLearnReply(projectName, doctorName) {
      if (!aiPlanBody) return;
      planMode = "learn";

      // 收集勾选项目（从项目卡片 checkbox 取）
      const checkedLabels = aiPlanBody.querySelectorAll(".ai-plan__block--projects .ai-plan__selectable input[type=checkbox]:checked");
      const selProjects = [];
      checkedLabels.forEach(function (cb) {
        const label = cb.closest(".ai-plan__selectable");
        const name = label && label.querySelector("strong") ? label.querySelector("strong").textContent : "";
        const key = cb.getAttribute("data-key") || "";
        if (name) selProjects.push({ name: name, key: key });
      });

      // 开场气泡（用第一个勾选项目作为主项目）
      const mainProj = (selProjects[0] && selProjects[0].name) || projectName;
      appendMessage("bot", deptT("lnGreeting", { project: mainProj, doctor: doctorName }));

      // 主体富内容气泡：按项目逐个展开机制/作用/适用范围
      // M 开头的键是"更多项目"卡片（M1/M2/M3 → beautyN Learn），其余是主流程项目（A1..C3 → projN Learn）
      const wrap = document.createElement("div");
      wrap.className = "ai-plan__msg ai-plan__msg--bot ai-plan__rich";
      const sections = selProjects.map(function (p) {
        const learnKey = p.key ? (p.key.charAt(0) === "M" ? "beauty" + p.key.slice(1) + "Learn" : "proj" + p.key + "Learn") : "";
        const desc = learnKey ? deptT(learnKey) : "";
        if (!desc) return ""; // 文案缺失时回退，避免空白
        // 去掉 desc 开头可能冗余的 <strong>【项目名】</strong> 前缀（卡片已显示项目名）
        const bodyDesc = desc.replace(/^\s*<strong>[^<]*<\/strong>\s*(<br\s*\/?>)?\s*/i, "");
        // 自动加粗段首标签：机制 / 作用 / 适用范围
        const richDesc = bodyDesc
          .replace(/机制[:：]/g, "<strong>机制：</strong>")
          .replace(/作用[:：]/g, "<strong>作用：</strong>")
          .replace(/适用范围[:：]/g, "<strong>适用范围：</strong>")
          .replace(/品牌[:：]/g, "<strong>品牌：</strong>")
          .replace(/资质[:：]/g, "<strong>资质：</strong>")
          .replace(/原理[:：]/g, "<strong>原理：</strong>")
          .replace(/功效[:：]/g, "<strong>功效：</strong>")
          .replace(/适配[:：]/g, "<strong>适配：</strong>")
          .replace(/维持[:：]/g, "<strong>维持：</strong>");
        return [
          '<div class="ai-plan__section ai-plan__section--learn">',
          '  <div class="ai-plan__section-body ai-plan__learn-body">',
          richDesc,
          '  </div>',
          '</div>'
        ].join("");
      }).join("");
      wrap.innerHTML = sections + '<p class="ai-plan__learn-end">' + deptT("lnEnd") + '</p>';
      aiPlanBody.appendChild(wrap);
      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
      // 了解详情后追加选项：详情已展示完，省略"再了解"，避免重复显示同样内容
      appendPostActionOptions(lastProjects || [], lastDoctors || [], "learn");
    }

    // 追加项目卡片（可勾选，按项目键集合显示对应子项目）
    // keys 为项目键数组（["A1","A2","A3"] 等，对应 projA1..projC3）
    function appendProjects(keys) {
      if (!aiPlanBody) return;
      const wrap = document.createElement("div");
      wrap.className = "ai-plan__block ai-plan__block--selectable ai-plan__block--projects";
      const showKeys = keys && keys.length ? keys : ["A1", "A2", "A3"];
      const cards = showKeys.map(function (k) {
        return [
          '  <label class="ai-plan__selectable">',
          '    <input type="checkbox" data-key="' + k + '" />',
          '    <span class="ai-plan__selected-tag">✓ 已选</span>',
          '    <div class="ai-plan__selectable-body">',
          '      <div class="ai-plan__selectable-head"><strong>' + deptT("proj" + k + "Name") + '</strong><span class="ai-plan__selectable-price">' + deptTX("proj" + k + "Price") + '</span></div>',
          '      <p>' + deptT("proj" + k + "Desc") + '</p>',
          '    </div>',
          '  </label>'
        ].join("");
      }).join("");
      wrap.innerHTML = [
        '<h4>' + deptT("projTitle") + '</h4>',
        '<div class="ai-plan__selectable-list">',
        cards,
        '</div>',
        '<p class="ai-plan__note">' + deptTX("noteSel") + '</p>',
      ].join("");
      aiPlanBody.appendChild(wrap);
      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // 追问选项→子项目
    function appendChoiceProjects(choiceKey) {
      const map = CHOICE_SUB_PROJ[currentDept] || CHOICE_SUB_PROJ.beauty;
      const keys = map[choiceKey] || ["A1", "A2", "A3"];
      appendProjects(keys);
    }

    // 追加医生卡片（可勾选）
    function appendDoctors() {
      if (!aiPlanBody) return;
      const wrap = document.createElement("div");
      wrap.className = "ai-plan__block ai-plan__block--selectable ai-plan__block--doctors";
      const imgs = deptDocImgs();
      wrap.innerHTML = [
        '<h4>' + deptT("docTitle") + '</h4>',
        '<p class="ai-plan__block-desc">' + deptT("docDesc") + '</p>',
        '<div class="ai-plan__selectable-list">',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><img class="ai-plan__doctor-avatar" src="' + imgs[0] + '" alt="医生" loading="lazy" /><strong>' + deptT("doc1Name") + '</strong></div>',
        '      <p>' + deptT("doc1Desc") + '</p>',
        '    </div>',
        '  </label>',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><img class="ai-plan__doctor-avatar" src="' + imgs[1] + '" alt="医生" loading="lazy" /><strong>' + deptT("doc2Name") + '</strong></div>',
        '      <p>' + deptT("doc2Desc") + '</p>',
        '    </div>',
        '  </label>',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><img class="ai-plan__doctor-avatar" src="' + imgs[2] + '" alt="医生" loading="lazy" /><strong>' + deptT("doc3Name") + '</strong></div>',
        '      <p>' + deptT("doc3Desc") + '</p>',
        '    </div>',
        '  </label>',
        '</div>',
      ].join("");
      aiPlanBody.appendChild(wrap);
      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // ---------- 选项3：想再了解下其他项目（先二选一确认方向） ----------
    function renderMoreOptions() {
      if (!aiPlanBody) return;
      planMode = "more";

      // 医美：更多医美项目 / 其他科室；其他科室：同科室更多项目 / 其他科室
      const sameLabel = currentDept === "beauty" ? _T("ap.moreBeauty") : deptT("moreSame");
      const deptLabel = _T("ap.moreDept");

      appendMessage("bot", deptT("moreAsk"));

      const wrap = document.createElement("div");
      wrap.className = "ai-plan__followups";
      wrap.innerHTML = [
        '<button type="button" class="ai-plan__followup" data-action="other-same">' + sameLabel + '</button>',
        '<button type="button" class="ai-plan__followup" data-action="other-dept">' + deptLabel + '</button>',
      ].join("");
      aiPlanBody.appendChild(wrap);

      wrap.querySelectorAll(".ai-plan__followup").forEach(function (btn) {
        btn.addEventListener("click", function () {
          wrap.querySelectorAll(".ai-plan__followup").forEach(function (b) {
            b.disabled = true;
          });
          btn.classList.add("is-selected");
          appendMessage("user", btn.textContent);
          aiPlanBody.scrollTop = aiPlanBody.scrollHeight;

          setTimeout(function () {
            if (btn.dataset.action === "other-same") {
              renderOtherBeauty();
            } else {
              renderOtherDept();
            }
            aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
          }, 500);
        });
      });

      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // 其他项目：同科室更多项目推荐（医美=光电类，其他科室=同科更多服务）
    function renderOtherBeauty() {
      if (!aiPlanBody) return;
      appendMessage("bot", deptT("beautyBot"));
      appendBeautyProjects();
      // 医美追加医生卡片；其他科室不重复推荐医生
      if (currentDept === "beauty") {
        appendDoctors();
      }
      setTimeout(function () {
        appendMessage("bot", _T("ap.botChoice2"));
        aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
      }, 400);
    }

    // 更多项目卡片（可勾选）
    function appendBeautyProjects() {
      if (!aiPlanBody) return;
      const wrap = document.createElement("div");
      wrap.className = "ai-plan__block ai-plan__block--selectable ai-plan__block--projects";
      wrap.innerHTML = [
        '<h4>' + deptT("beautyTitle") + '</h4>',
        '<div class="ai-plan__selectable-list">',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" data-key="M1" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + deptT("beauty1Name") + '</strong><span class="ai-plan__selectable-price">' + deptTX("beauty1Price") + '</span></div>',
        '      <p>' + deptT("beauty1Desc") + '</p>',
        '    </div>',
        '  </label>',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" data-key="M2" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + deptT("beauty2Name") + '</strong><span class="ai-plan__selectable-price">' + deptTX("beauty2Price") + '</span></div>',
        '      <p>' + deptT("beauty2Desc") + '</p>',
        '    </div>',
        '  </label>',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" data-key="M3" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + deptT("beauty3Name") + '</strong><span class="ai-plan__selectable-price">' + deptTX("beauty3Price") + '</span></div>',
        '      <p>' + deptT("beauty3Desc") + '</p>',
        '    </div>',
        '  </label>',
'</div>',
        '<p class="ai-plan__note">' + deptTX("noteSel") + '</p>',
      ].join("");
      aiPlanBody.appendChild(wrap);
      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // 其他科室服务：重新选择 Q4 科室
    function renderOtherDept() {
      if (!aiPlanBody) return;
      appendMessage("bot", _T("ap.deptBot"));

      const depts = _T("ap.depts") || [];

      const wrap = document.createElement("div");
      wrap.className = "ai-plan__followups";
      wrap.innerHTML = depts.map(function (d) {
        return '<button type="button" class="ai-plan__followup">' + d + '</button>';
      }).join("");
      aiPlanBody.appendChild(wrap);

      wrap.querySelectorAll(".ai-plan__followup").forEach(function (btn) {
        btn.addEventListener("click", function () {
          wrap.querySelectorAll(".ai-plan__followup").forEach(function (b) {
            b.disabled = true;
          });
          btn.classList.add("is-selected");
          appendMessage("user", btn.textContent);
          aiPlanBody.scrollTop = aiPlanBody.scrollHeight;

          setTimeout(function () {
            appendMessage("bot", _T("ap.deptRecord", { dept: btn.textContent }));
            aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
          }, 500);
        });
      });

      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // ---------- 勾选状态监听：实时更新"确认选择"按钮 ----------
    let selectedProjects = [];
    let selectedDoctors = [];

    function updateConfirmBtn() {
      if (!aiPlanConfirm) return;
      const checkedBoxes = aiPlanBody.querySelectorAll(".ai-plan__selectable input[type=checkbox]:checked");
      const count = checkedBoxes.length;
      aiPlanConfirm.hidden = count === 0;
      if (count > 0) {
        aiPlanConfirm.textContent = _T("aiplan.confirmCount", { count: count });
      }
    }

    // 委托监听所有 checkbox 变化
    if (aiPlanBody) {
      aiPlanBody.addEventListener("change", function (e) {
        if (e.target && e.target.type === "checkbox") {
          updateConfirmBtn();
        }
      });
    }

    // ---------- 确认选择：收集勾选项，作为用户消息吐出 ----------
    if (aiPlanConfirm) {
      aiPlanConfirm.addEventListener("click", function () {
        const checkedProjects = [];
        const checkedDoctors = [];
        aiPlanBody.querySelectorAll(".ai-plan__selectable").forEach(function (card) {
          const cb = card.querySelector("input[type=checkbox]");
          if (cb && cb.checked) {
            const head = card.querySelector(".ai-plan__selectable-head strong");
            const price = card.querySelector(".ai-plan__selectable-price");
            const name = head ? head.textContent : "";
            // 判断是项目还是医生（医生卡片没有 price）
            if (price) {
              checkedProjects.push(name);
            } else {
              checkedDoctors.push(name);
            }
          }
        });

        // 组装用户消息：以"我对……比较感兴趣"形式呈现
        const interests = checkedProjects.concat(checkedDoctors);
        const msgText = _T("ap.interest", { items: interests.join("、") });

        // 更新历史记录的意向字段
        if (window.__updateLastMedicalRecord && interests.length > 0) {
          window.__updateLastMedicalRecord({
            intent: _T("ap.interest", { items: interests.join("、") }),
          });
        }

        // 作为用户消息吐出
        const userMsg = document.createElement("div");
        userMsg.className = "ai-plan__msg ai-plan__msg--user";
        userMsg.textContent = msgText;
        aiPlanBody.appendChild(userMsg);
        aiPlanBody.scrollTop = aiPlanBody.scrollHeight;

        // 隐藏确认按钮，禁用已选卡片（防止重复提交）
        aiPlanConfirm.hidden = true;
        aiPlanBody.querySelectorAll(".ai-plan__selectable input[type=checkbox]").forEach(function (cb) {
          cb.disabled = true;
        });

        // AI 直接回复通知，不再追加三个追问选项
        appendMessage("bot", _T("aiplan.agentNoticed"));
      });
    }

    // ---------- 常驻输入框：发送文字消息 ----------
    function sendAiMessage() {
      if (!aiPlanInput) return;
      const text = aiPlanInput.value.trim();
      if (!text) return;

      // 用户消息
      appendMessage("user", text);
      aiPlanInput.value = "";

      // AI 回复
      setTimeout(function () {
        appendMessage("bot", _T("ap.sendReply"));
        aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
      }, 600);
    }

    if (aiPlanSend) {
      aiPlanSend.addEventListener("click", sendAiMessage);
    }
    if (aiPlanInput) {
      aiPlanInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") sendAiMessage();
      });
    }

    updateUI();

    /* ---------- 日历选择器逻辑 ---------- */
    (function initCalendar() {
      const calGrid = document.getElementById("calGrid");
      const calTitle = document.getElementById("calTitle");
      const calPrev = document.getElementById("calPrev");
      const calNext = document.getElementById("calNext");
      const calUndecided = document.getElementById("calUndecided");

      if (!calGrid) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let viewYear = today.getFullYear();
      let viewMonth = today.getMonth(); // 0-11
      let selectedDate = null;
      // 暴露重置+渲染函数给外层 resetQuiz 使用
      calRender = function () {
        selectedDate = null;
        render();
      };

      const dayKeys = ["day0", "day1", "day2", "day3", "day4", "day5", "day6"];
      const dayNames = dayKeys.map(function (k) {
        return window.__t ? window.__t("calendar." + k) : ["日", "一", "二", "三", "四", "五", "六"][dayKeys.indexOf(k)];
      });

      function fmtDate(d) {
        return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
      }

      function render() {
        if (calTitle) {
          calTitle.textContent = window.__t
            ? window.__t("calendar.month", { year: viewYear, month: viewMonth + 1 })
            : viewYear + " 年 " + (viewMonth + 1) + " 月";
        }

        // 星期行
        let html = "";
        dayNames.forEach(function (n) {
          html += '<div class="quiz__calendar-day-name">' + n + '</div>';
        });

        const firstDay = new Date(viewYear, viewMonth, 1);
        const lastDay = new Date(viewYear, viewMonth + 1, 0);
        const startWeekday = firstDay.getDay(); // 0=周日
        const daysInMonth = lastDay.getDate();

        // 上个月末几天
        const prevLastDay = new Date(viewYear, viewMonth, 0).getDate();
        for (let i = startWeekday - 1; i >= 0; i--) {
          html += '<button type="button" class="quiz__calendar-cell is-other-month is-disabled" disabled>' + (prevLastDay - i) + '</button>';
        }

        // 本月
        for (let d = 1; d <= daysInMonth; d++) {
          const cellDate = new Date(viewYear, viewMonth, d);
          cellDate.setHours(0, 0, 0, 0);
          const isPast = cellDate < today;
          const isToday = cellDate.getTime() === today.getTime();
          const isSelected = selectedDate && cellDate.getTime() === selectedDate.getTime();

          let cls = "quiz__calendar-cell";
          if (isPast) cls += " is-disabled";
          if (isToday) cls += " is-today";
          if (isSelected) cls += " is-selected";
          const disabled = isPast ? "disabled" : "";

          const dateVal = cellDate.getFullYear() + "-" + (cellDate.getMonth() + 1) + "-" + cellDate.getDate();
          html += '<button type="button" class="' + cls + '" data-date="' + dateVal + '" ' + disabled + '>' + d + '</button>';
        }

        // 下个月头几天
        const totalCells = startWeekday + daysInMonth;
        const remainder = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remainder; i++) {
          html += '<button type="button" class="quiz__calendar-cell is-other-month is-disabled" disabled>' + i + '</button>';
        }

        calGrid.innerHTML = html;

        // 绑定日期点击
        calGrid.querySelectorAll(".quiz__calendar-cell:not(.is-disabled)").forEach(function (cell) {
          cell.addEventListener("click", function () {
            const parts = cell.dataset.date.split("-");
            selectedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            answers[6] = fmtDate(selectedDate);
            // 取消"暂未确定"选中状态
            if (calUndecided) calUndecided.classList.remove("is-selected");
            render();
            // 选中后自动进入下一步
            setTimeout(function () {
              if (current === 6 && current < total) {
                current++;
                updateUI();
              }
            }, 250);
          });
        });
      }

      if (calPrev) {
        calPrev.addEventListener("click", function () {
          viewMonth--;
          if (viewMonth < 0) { viewMonth = 11; viewYear--; }
          render();
        });
      }

      if (calNext) {
        calNext.addEventListener("click", function () {
          viewMonth++;
          if (viewMonth > 11) { viewMonth = 0; viewYear++; }
          render();
        });
      }

      if (calUndecided) {
        calUndecided.addEventListener("click", function () {
          selectedDate = null;
          answers[6] = "暂未确定";
          calUndecided.classList.add("is-selected");
          render();
          // 选中后自动进入下一步
          setTimeout(function () {
            if (current === 6 && current < total) {
              current++;
              updateUI();
            }
          }, 250);
        });
      }

      render();

      // 语言切换时刷新日历
      window.addEventListener("langchange", function () { render(); });
    })();
  })();

  /* ---------- 酒店搜索自动匹配 ---------- */
  (function initHotelSearch() {
    const input = document.getElementById("hotelInput");
    const results = document.getElementById("hotelResults");
    if (!input || !results) return;

    // 模拟酒店数据库（常见酒店名称）
    const hotels = [
      "上海外滩华尔道夫酒店",
      "上海和平饭店",
      "上海半岛酒店",
      "上海浦东香格里拉大酒店",
      "上海金茂君悦大酒店",
      "北京王府半岛酒店",
      "北京四季酒店",
      "北京国贸大酒店",
      "广州四季酒店",
      "广州白天鹅宾馆",
      "深圳瑞吉酒店",
      "深圳柏悦酒店",
      "杭州西子湖四季酒店",
      "杭州柏悦酒店",
      "成都华尔道夫酒店",
      "苏州W酒店",
      "南京金陵饭店",
      "武汉光谷凯悦酒店",
      "西安索菲特传奇酒店",
      "希尔顿酒店",
      "万豪酒店",
      "凯悦酒店",
      "香格里拉酒店",
      "洲际酒店",
      "皇冠假日酒店",
      "丽思卡尔顿酒店",
      "文华东方酒店",
      "悦榕庄",
      "威斯汀酒店",
      "喜来登酒店",
    ];

    // 匹配算法：精确匹配优先，包含匹配其次，字符匹配最后
    function matchHotels(query) {
      const q = query.toLowerCase();
      return hotels
        .map(function (h) {
          const name = h.toLowerCase();
          let score = 0;
          if (name === q) {
            score = 100;
          } else if (name.indexOf(q) !== -1) {
            score = 80 - (name.length - q.length);
          } else {
            let matched = 0;
            for (let i = 0; i < q.length; i++) {
              if (name.indexOf(q[i]) !== -1) matched++;
            }
            if (matched === q.length && q.length > 0) score = 50 + matched;
          }
          return { name: h, score: score };
        })
        .filter(function (item) { return item.score > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, 6);
    }

    function renderResults(list) {
      if (!list || list.length === 0) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }
      let html = "";
      list.forEach(function (item) {
        html += '<button type="button" class="quiz__hotel-item" data-hotel="' + item.name + '">' + item.name + '</button>';
      });
      results.innerHTML = html;
      results.hidden = false;

      results.querySelectorAll(".quiz__hotel-item").forEach(function (btn) {
        btn.addEventListener("click", function () {
          input.value = btn.dataset.hotel;
          results.hidden = true;
          results.innerHTML = "";
        });
      });
    }

    input.addEventListener("input", function () {
      const val = input.value.trim();
      if (val.length === 0) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }
      renderResults(matchHotels(val));
    });

    // 点击输入框外部关闭结果
    document.addEventListener("click", function (e) {
      if (e.target !== input && !results.contains(e.target)) {
        results.hidden = true;
      }
    });
  })();

  /* ---------- 简易 Toast ---------- */
  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
      // 注入样式
      const style = document.createElement("style");
      style.textContent = `
        .toast {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(-100px);
          background: #fff;
          color: #1a2b2b;
          padding: 14px 24px;
          border-radius: 999px;
          box-shadow: 0 8px 24px rgba(26,43,43,.16);
          font-size: 14px;
          font-weight: 500;
          z-index: 9999;
          transition: transform .35s ease, opacity .35s ease;
          opacity: 0;
          pointer-events: none;
          max-width: 90%;
        }
        .toast.is-show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }

    toast.textContent = message;
    toast.classList.add("is-show");

    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove("is-show");
    }, 3000);
  }

  /* ---------- 平滑滚动（兼容处理） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href.length < 2) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

      window.scrollTo({
        top: top,
        behavior: "smooth",
      });
    });
  });

  /* ---------- 监听滚动 ---------- */
  let scrollTimer = null;
  window.addEventListener(
    "scroll",
    function () {
      if (scrollTimer) return;
      scrollTimer = requestAnimationFrame(function () {
        onScroll();
        scrollTimer = null;
      });
    },
    { passive: true }
  );

  // 初始触发一次
  onScroll();

  /* ---------- AI 助手气泡 + 就诊记录持久化 ---------- */
  (function initAIChat() {
    const bubble = document.getElementById("aiBubble");
    if (!bubble) return;

    // ---------- 就诊历史记录（localStorage 持久化，仅保留最近一条） ----------
    const HISTORY_KEY = "zhuozheng_medical_history";

    function getHistory() {
      try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
      } catch (e) {
        return [];
      }
    }

    function saveHistory(list) {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      } catch (e) { /* 忽略存储异常 */ }
    }

    // 供问卷流程调用：保存一条就诊记录（只保留最近一条）
    // 同步持久化 answers + 姓名，便于 AI 气泡再次点击时恢复方案进度
    window.__addMedicalRecord = function (record) {
      const list = [{
        time: record.time || "",
        name: record.name || "用户",
        summary: record.summary || "",
        intent: record.intent || "",
        answers: record.answers || null,
      }];
      saveHistory(list);
    };

    // 供 openModal 调用：读取最近一次的问卷答案 + 姓名
    window.__getLastAnswers = function () {
      const list = getHistory();
      if (!list || list.length === 0) return null;
      const r = list[0] || {};
      if (!r.answers) return null;
      return { answers: r.answers, name: r.name || "" };
    };

    // 供问卷流程调用：更新最新一条记录（如确认选择后补充意向）
    window.__updateLastMedicalRecord = function (patch) {
      const list = getHistory();
      if (list.length > 0) {
        Object.assign(list[0], patch);
        saveHistory(list);
      }
    };

    // 清空最近一条就诊记录（用户点击"重新填写问卷"时使用）
    window.__clearLastMedicalRecord = function () {
      try { localStorage.removeItem(HISTORY_KEY); } catch (e) { /* ignore */ }
    };

    // 点击 AI 气泡：直接进入完整方案流程（与问卷后页面一致）
    bubble.addEventListener("click", function () {
      hideBubbleCard();
      if (window.__openQuizModal) window.__openQuizModal();
    });

    // ---------- agent 总结浮层（提交预约后展示 8s 自动消失） ----------
    const card = document.getElementById("aiBubbleCard");
    const cardSummary = document.getElementById("aiBubbleCardSummary");
    let cardTimer = null;

    function hideBubbleCard() {
      if (!card) return;
      card.hidden = true;
      if (cardTimer) { clearTimeout(cardTimer); cardTimer = null; }
    }
    window.__hideBubbleCard = hideBubbleCard;

    window.__showBubbleCard = function (info) {
      if (!card) return;
      if (cardSummary) {
        const tpl = (window.__t && window.__t("aiBubble.recorded")) || "已为您记录本次预约（{summary}）";
        cardSummary.textContent = tpl.replace(/\{summary\}/g, info.summary || "");
      }
      card.hidden = false;
      if (cardTimer) clearTimeout(cardTimer);
      cardTimer = setTimeout(function () {
        card.hidden = true;
        cardTimer = null;
      }, 8000);
    };

    // 语言切换时，重渲染浮层文本（保留最近一条记录的内容）
    document.addEventListener("langchange", function () {
      if (!card || card.hidden) return;
      // applyLang 已经把 data-i18n 节点替换为当前语言，无需额外操作
    });
  })();
})();
