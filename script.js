(() => {
  "use strict";

  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const touch = window.matchMedia(
    "(hover: none)"
  ).matches;

  /* ============================================================
     Loader
     ============================================================ */

  const loader = document.getElementById("pageLoader");

  const hideLoader = () => {
    if (!loader) return;

    loader.classList.add("done");

    setTimeout(() => {
      loader.remove();
    }, 800);
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => setTimeout(hideLoader, 220),
      { once: true }
    );
  } else {
    setTimeout(hideLoader, 220);
  }

  window.addEventListener(
    "load",
    () => setTimeout(hideLoader, 180),
    { once: true }
  );

  setTimeout(hideLoader, 2600);


  /* ============================================================
     Lightweight Privacy-Conscious Analytics
     ============================================================ */

  const Analytics = (() => {
    const key = "sowmya_portfolio_session";
    let session = null;

    const randomId = () => {
      try {
        if (crypto?.getRandomValues) {
          const bytes = new Uint8Array(8);

          crypto.getRandomValues(bytes);

          return [...bytes]
            .map(v => v.toString(16).padStart(2, "0"))
            .join("");
        }
      } catch {}

      return Math.random().toString(36).slice(2);
    };

    try {
      session = sessionStorage.getItem(key);

      if (!session) {
        session =
          `sess_${randomId()}_${Date.now().toString(36)}`;

        sessionStorage.setItem(key, session);
      }
    } catch {
      session = `sess_${randomId()}`;
    }

    function send(type, detail = null) {
      try {
        const payload = JSON.stringify({
          event_type: type,
          session_id: session,
          timestamp: new Date().toISOString(),
          path: location.pathname,
          referrer: document.referrer || null,
          device:
            innerWidth < 640
              ? "mobile"
              : innerWidth < 1024
                ? "tablet"
                : "desktop",
          detail
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/track",
            new Blob(
              [payload],
              { type: "application/json" }
            )
          );
        } else {
          fetch("/api/track", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: payload,
            keepalive: true
          }).catch(() => {});
        }
      } catch {}
    }

    return { send };
  })();

  Analytics.send("SESSION_STARTED");

  window.addEventListener(
    "pagehide",
    () => Analytics.send("SESSION_ENDED")
  );

  document
    .querySelectorAll("[data-track]")
    .forEach(el => {
      el.addEventListener("click", () => {
        const value = el.dataset.track || "";
        const [type, detail] = value.split(":");

        if (type) {
          Analytics.send(type, detail || null);
        }
      });
    });


  /* ============================================================
     Scroll UI
     ============================================================ */

  const header =
    document.getElementById("siteHeader");

  const progress =
    document.getElementById("scrollProgress");

  const journeyProgress =
    document.getElementById("journeyProgress");

  const beliefProgress =
    document.getElementById("beliefProgress");

  const beliefRunner =
    document.querySelector(".belief-runner");

  const beliefWords = [
    ...document.querySelectorAll(
      ".belief-words span"
    )
  ];

  const backToTop =
    document.getElementById("backToTop");


  function updateScrollUI() {
    header?.classList.toggle(
      "scrolled",
      scrollY > 30
    );

    backToTop?.classList.toggle(
      "visible",
      scrollY > 600
    );

    const max =
      document.documentElement.scrollHeight -
      innerHeight;

    const pct =
      max > 0
        ? Math.min(
            100,
            Math.max(
              0,
              (scrollY / max) * 100
            )
          )
        : 0;

    if (progress) {
      progress.style.width = `${pct}%`;
    }


    /* Journey progress */

    const journey =
      document.querySelector(".journey-map");

    if (journey && journeyProgress) {
      const r =
        journey.getBoundingClientRect();

      const visible = Math.min(
        Math.max(innerHeight - r.top, 0),
        r.height
      );

      journeyProgress.style.height =
        `${r.height
          ? (visible / r.height) * 100
          : 0}%`;
    }


    /* Belief progress */

    if (beliefProgress && beliefRunner) {
      const belief =
        document.querySelector(".belief-track");

      if (belief) {
        const r =
          belief.getBoundingClientRect();

        const visible = Math.min(
          Math.max(innerHeight - r.top, 0),
          r.height
        );

        const p =
          r.height
            ? Math.min(
                100,
                (visible / r.height) * 100
              )
            : 0;

        beliefProgress.style.width =
          `${p}%`;

        beliefRunner.style.left =
          `${p}%`;

        const activeCount = Math.max(
          0,
          Math.min(
            beliefWords.length,
            Math.ceil(
              (p / 100) *
              beliefWords.length
            )
          )
        );

        beliefWords.forEach((word, i) => {
          word.classList.toggle(
            "lit",
            i < activeCount
          );
        });
      }
    }
  }

  updateScrollUI();

  addEventListener(
    "scroll",
    updateScrollUI,
    { passive: true }
  );

  addEventListener(
    "resize",
    updateScrollUI
  );


  /* ============================================================
     MOBILE NAVIGATION
     ============================================================ */

  const menuToggle =
    document.getElementById("menuToggle");

  const mobileMenu =
    document.getElementById("mobileMenu");


  /*
     IMPORTANT:
     Always force the mobile menu to start CLOSED.

     This prevents the menu from appearing over
     the hero section when the page first loads.
  */

  if (mobileMenu) {
    mobileMenu.classList.remove("open");
  }

  if (menuToggle) {
    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Open navigation"
    );
  }


  /* Hamburger click */

  menuToggle?.addEventListener("click", () => {
    if (!mobileMenu) return;

    const isOpen =
      mobileMenu.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen
        ? "Close navigation"
        : "Open navigation"
    );
  });


  /* Close menu when a navigation item is clicked */

  mobileMenu
    ?.querySelectorAll("a")
    .forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");

        menuToggle?.setAttribute(
          "aria-expanded",
          "false"
        );

        menuToggle?.setAttribute(
          "aria-label",
          "Open navigation"
        );
      });
    });


  /* Close mobile menu with Escape */

  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape" &&
        mobileMenu?.classList.contains("open")
      ) {
        mobileMenu.classList.remove("open");

        menuToggle?.setAttribute(
          "aria-expanded",
          "false"
        );

        menuToggle?.setAttribute(
          "aria-label",
          "Open navigation"
        );
      }
    }
  );


  /*
     If the screen changes from mobile to desktop,
     make sure the mobile menu is reset.
  */

  const mobileBreakpoint =
    window.matchMedia(
      "(max-width: 768px)"
    );

  const handleBreakpointChange = event => {
    if (!event.matches && mobileMenu) {
      mobileMenu.classList.remove("open");

      menuToggle?.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle?.setAttribute(
        "aria-label",
        "Open navigation"
      );
    }
  };

  mobileBreakpoint.addEventListener(
    "change",
    handleBreakpointChange
  );


  /* ============================================================
     Reveal Animations
     ============================================================ */

  const reveals =
    document.querySelectorAll(".reveal");

  if (
    "IntersectionObserver" in window &&
    !reduced
  ) {
    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("in");

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.12
        }
      );

    reveals.forEach((el, i) => {
      el.style.transitionDelay =
        `${Math.min(i * 35, 240)}ms`;

      observer.observe(el);
    });
  } else {
    reveals.forEach(el =>
      el.classList.add("in")
    );
  }


  /* ============================================================
     Fast Click Feedback
     ============================================================ */

  document
    .querySelectorAll("[data-clickfx]")
    .forEach(el => {
      el.addEventListener(
        "pointerdown",
        () => {
          el.classList.remove(
            "click-punch"
          );

          void el.offsetWidth;

          el.classList.add(
            "click-punch"
          );

          setTimeout(() => {
            el.classList.remove(
              "click-punch"
            );
          }, 180);
        }
      );
    });


  /* ============================================================
     Back to Top
     ============================================================ */

  backToTop?.addEventListener(
    "click",
    () => {
      window.scrollTo({
        top: 0,
        behavior: reduced ? "auto" : "smooth"
      });
    }
  );


  /* ============================================================
     Pointer Cursor + Magnetic Controls
     ============================================================ */

  if (!touch && !reduced) {
    const dot =
      document.getElementById("cursorDot");

    const ring =
      document.getElementById("cursorRing");

    let mx = innerWidth / 2;
    let my = innerHeight / 2;

    let rx = mx;
    let ry = my;


    addEventListener(
      "mousemove",
      event => {
        mx = event.clientX;
        my = event.clientY;
      }
    );


    const cursorLoop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;

      if (dot) {
        dot.style.transform =
          `translate(${mx - 3}px, ${my - 3}px)`;
      }

      if (ring) {
        ring.style.transform =
          `translate(${rx - 18}px, ${ry - 18}px)`;
      }

      requestAnimationFrame(
        cursorLoop
      );
    };

    cursorLoop();


    document
      .querySelectorAll(
        "a,button,[data-magnetic]"
      )
      .forEach(el => {
        el.addEventListener(
          "mouseenter",
          () =>
            ring?.classList.add(
              "active"
            )
        );

        el.addEventListener(
          "mouseleave",
          () => {
            ring?.classList.remove(
              "active"
            );

            el.style.transform = "";
          }
        );
      });


    document
      .querySelectorAll("[data-magnetic]")
      .forEach(el => {
        el.addEventListener(
          "mousemove",
          event => {
            const r =
              el.getBoundingClientRect();

            el.style.transform =
              `translate(${
                (event.clientX -
                  (r.left + r.width / 2)) *
                0.08
              }px,${
                (event.clientY -
                  (r.top + r.height / 2)) *
                0.08
              }px)`;
          }
        );

        el.addEventListener(
          "mouseleave",
          () => {
            el.style.transform = "";
          }
        );
      });


    document
      .querySelectorAll("[data-tilt]")
      .forEach(card => {
        card.addEventListener(
          "mousemove",
          event => {
            const r =
              card.getBoundingClientRect();

            const x =
              (event.clientX - r.left) /
                r.width -
              0.5;

            const y =
              (event.clientY - r.top) /
                r.height -
              0.5;

            card.style.setProperty(
              "--mx",
              `${(x + 0.5) * 100}%`
            );

            card.style.setProperty(
              "--my",
              `${(y + 0.5) * 100}%`
            );

            card.style.transform =
              `perspective(900px)
               rotateX(${y * -3.5}deg)
               rotateY(${x * 4.5}deg)
               translateY(-5px)`;
          }
        );

        card.addEventListener(
          "mouseleave",
          () => {
            card.style.transform = "";
          }
        );
      });
  }


  /* ============================================================
     Stack Capability Map
     ============================================================ */

  const stackData = {
    ai: {
      title: "AI / GENERATIVE AI",
      text:
        "Machine Learning · Deep Learning · NLP · LLMs · Generative AI · RAG · Embeddings · Vector Search · Multimodal AI",
      pills: [
        "LLMs",
        "GenAI",
        "RAG",
        "Embeddings",
        "Multimodal"
      ]
    },

    ml: {
      title:
        "ML / DEEP LEARNING / NLP",
      text:
        "Supervised learning · model development · evaluation · neural networks · computer vision · NLP pipelines · feature engineering",
      pills: [
        "Scikit-learn",
        "PyTorch",
        "TensorFlow",
        "OpenCV",
        "NLP"
      ]
    },

    backend: {
      title:
        "BACKEND / FULL-STACK",
      text:
        "Python services · FastAPI · REST APIs · Pydantic · React · Vite · databases · validation · integration · Docker",
      pills: [
        "Python",
        "FastAPI",
        "React",
        "REST",
        "Databases",
        "Docker"
      ]
    },

    cloud: {
      title: "AWS / AZURE",
      text:
        "Amazon Bedrock · Bedrock AgentCore · Lambda · S3 · DynamoDB · ECR · CodeBuild · CloudWatch · IAM · Azure AI · Functions · Container Apps",
      pills: [
        "AWS",
        "Bedrock",
        "AgentCore",
        "Azure AI",
        "Functions"
      ]
    },

    data: {
      title:
        "DATA / RETRIEVAL",
      text:
        "SQL · Pandas · NumPy · embeddings · semantic search · knowledge systems · vector retrieval · document processing",
      pills: [
        "SQL",
        "Pandas",
        "NumPy",
        "Vector Search",
        "Knowledge"
      ]
    },

    agents: {
      title:
        "AGENTS / TOOLS / GOVERNANCE",
      text:
        "AWS Strands Agents SDK · tool calling · orchestration · execution loops · state · human-in-the-loop · guardrails · risk controls",
      pills: [
        "Strands",
        "Tools",
        "Orchestration",
        "HITL",
        "Guardrails"
      ]
    },

    dev: {
      title:
        "DEVELOPMENT / DELIVERY",
      text:
        "Git · GitHub · Docker · APIs · structured logging · health checks · request correlation · deployment workflows · observability",
      pills: [
        "Git",
        "Docker",
        "APIs",
        "Logging",
        "CloudWatch"
      ]
    }
  };


  const stackTitle =
    document.getElementById(
      "stackTitle"
    );

  const stackText =
    document.getElementById(
      "stackText"
    );

  const stackIndex =
    document.getElementById(
      "stackIndex"
    );

  const stackPills =
    document.getElementById(
      "stackPills"
    );

  const stackKeys =
    Object.keys(stackData);


  function renderStack(key) {
    const data =
      stackData[key];

    if (!data) return;

    const idx =
      stackKeys.indexOf(key) + 1;


    stackTitle?.animate(
      [
        {
          opacity: 1,
          transform:
            "translateY(0)"
        },
        {
          opacity: 0,
          transform:
            "translateY(8px)"
        },
        {
          opacity: 1,
          transform:
            "translateY(0)"
        }
      ],
      {
        duration: 360,
        easing: "ease-out"
      }
    );


    if (stackTitle) {
      stackTitle.textContent =
        data.title;
    }

    if (stackText) {
      stackText.textContent =
        data.text;
    }

    if (stackIndex) {
      stackIndex.textContent =
        String(idx).padStart(2, "0");
    }

    if (stackPills) {
      stackPills.innerHTML =
        data.pills
          .map(
            pill =>
              `<span>${pill}</span>`
          )
          .join("");
    }
  }


  document
    .querySelectorAll(".stack-tab")
    .forEach(tab => {
      tab.addEventListener(
        "click",
        () => {
          document
            .querySelectorAll(
              ".stack-tab"
            )
            .forEach(t =>
              t.classList.remove(
                "active"
              )
            );

          tab.classList.add(
            "active"
          );

          renderStack(
            tab.dataset.stack
          );

          Analytics.send(
            "STACK_CAPABILITY_SELECTED",
            tab.dataset.stack
          );
        }
      );
    });


  renderStack("ai");


  /* ============================================================
     Stack Particle Field
     ============================================================ */

  const sc =
    document.getElementById(
      "stackCanvas"
    );

  const sctx =
    sc?.getContext("2d");

  let snodes = [];


  function resizeStack() {
    if (!sc || !sctx) return;

    const r =
      sc.getBoundingClientRect();

    const d =
      Math.min(
        devicePixelRatio || 1,
        1.5
      );

    sc.width = r.width * d;
    sc.height = r.height * d;

    sctx.setTransform(
      d,
      0,
      0,
      d,
      0,
      0
    );

    snodes =
      Array.from(
        { length: 34 },
        () => ({
          x:
            Math.random() *
            r.width,

          y:
            Math.random() *
            r.height,

          vx:
            (Math.random() - 0.5) *
            0.18,

          vy:
            (Math.random() - 0.5) *
            0.18,

          p:
            Math.random() *
            6.28
        })
      );
  }


  function animateStack() {
    if (
      !sc ||
      !sctx ||
      reduced
    ) {
      return;
    }

    const r =
      sc.getBoundingClientRect();

    sctx.clearRect(
      0,
      0,
      r.width,
      r.height
    );


    snodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;
      node.p += 0.012;

      if (
        node.x < 0 ||
        node.x > r.width
      ) {
        node.vx *= -1;
      }

      if (
        node.y < 0 ||
        node.y > r.height
      ) {
        node.vy *= -1;
      }
    });


    for (
      let i = 0;
      i < snodes.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < snodes.length;
        j++
      ) {
        const a = snodes[i];
        const b = snodes[j];

        const d =
          Math.hypot(
            a.x - b.x,
            a.y - b.y
          );

        if (d < 100) {
          sctx.strokeStyle =
            `rgba(56,217,255,${
              (1 - d / 100) *
              0.10
            })`;

          sctx.lineWidth = 0.6;

          sctx.beginPath();
          sctx.moveTo(
            a.x,
            a.y
          );

          sctx.lineTo(
            b.x,
            b.y
          );

          sctx.stroke();
        }
      }
    }


    snodes.forEach(node => {
      const p =
        (Math.sin(node.p) + 1) /
        2;

      sctx.fillStyle =
        `rgba(61,139,255,${
          0.16 + p * 0.18
        })`;

      sctx.beginPath();

      sctx.arc(
        node.x,
        node.y,
        1 + p * 0.5,
        0,
        Math.PI * 2
      );

      sctx.fill();
    });


    requestAnimationFrame(
      animateStack
    );
  }


  if (sc) {
    resizeStack();

    addEventListener(
      "resize",
      resizeStack
    );

    if (!reduced) {
      animateStack();
    }
  }


  /* ============================================================
     Project Case Studies
     ============================================================ */

  const projects = {

    conference: {
      kicker:
        "01 / AGENTIC AI",

      title:
        "Conference Room Booking Agent",

      sub:
        "Multi-agent orchestration deployed around AWS Bedrock AgentCore.",

      flow: [
        "USER",
        "AGENT",
        "REASONING",
        "TOOL",
        "DYNAMODB",
        "BOOKING"
      ],

      problem:
        "A real booking workflow needs more than an answer: availability must be checked, tools must be called correctly and state must persist.",

      approach:
        "Built a multi-agent workflow using the AWS Strands Agents SDK where the agent interprets requests, interacts with booking tools and persists state.",

      architecture:
        "Request → agent reasoning → tool interaction → DynamoDB availability/state → booking result, with the system deployed to a real AWS runtime.",

      tech: [
        "Python",
        "AWS Strands Agents SDK",
        "Amazon Bedrock",
        "Bedrock AgentCore",
        "DynamoDB",
        "IAM",
        "ECR",
        "CodeBuild",
        "CloudWatch"
      ],

      outcome:
        "An end-to-end agent workflow demonstrating the transition from an agent prototype to a deployed cloud system.",

      lesson:
        "Agent reliability depends heavily on tool contracts, state handling and the infrastructure around the model.",

      link:
        "https://github.com/sowmya13531/conference.git"
    },


    truthx: {
      kicker:
        "02 / MULTIMODAL AI",

      title:
        "TRUTHX",

      sub:
        "Agentic multimodal digital-media forensics console.",

      flow: [
        "VISION",
        "AUDIO",
        "LIP-SYNC",
        "METADATA",
        "PROVENANCE",
        "FUSION",
        "RISK"
      ],

      problem:
        "Manipulated media is rarely captured reliably by a single signal. Different modalities reveal different evidence.",

      approach:
        "Designed a multimodal architecture that analyzes visual, audio, lip-sync, metadata and provenance signals before combining them into a risk assessment.",

      architecture:
        "Independent modality analysis → signal normalization → evidence fusion → combined risk assessment.",

      tech: [
        "Computer Vision",
        "Audio Analysis",
        "Lip-Sync",
        "Metadata",
        "Provenance",
        "Agentic AI"
      ],

      outcome:
        "A multimodal console concept demonstrating how multiple imperfect signals can be combined into a more useful forensic assessment.",

      lesson:
        "The strength of a multimodal system often comes from combining weak signals intelligently rather than searching for one perfect detector.",

      link:
        "https://github.com/sowmya13531/TRUTHX.git"
    },


    openworker: {
      kicker:
        "03 / AGENT RUNTIME",

      title:
        "Mini-OpenWorker",

      sub:
        "A hand-built agentic AI runtime and tool-orchestration loop.",

      flow: [
        "LLM",
        "EXECUTION",
        "TOOLS",
        "RISK",
        "SECURITY",
        "HITL",
        "ACTION"
      ],

      problem:
        "Using agent SDKs is useful, but understanding the execution loop underneath them creates stronger engineering intuition.",

      approach:
        "Built a lightweight implementation of an agent loop, LLM-driven tool calling, modular tool registry and multi-step execution.",

      architecture:
        "LLM reasoning → tool selection → risk governance → security checks → human approval → tool execution → result feedback → next reasoning step.",

      tech: [
        "Python",
        "LLMs",
        "Agentic AI",
        "Tool Orchestration",
        "Risk Governance",
        "Security"
      ],

      outcome:
        "A small runtime that makes the abstractions inside commercial agent frameworks concrete and inspectable.",

      lesson:
        "Building the loop directly clarified why tool contracts, governance and feedback are central to reliable agents.",

      link:
        "https://github.com/sowmya13531/Mini-OpenWorker.git"
    },


    aura: {
      kicker:
        "04 / AI SAFETY / PRIVATE",

      title:
        "AURA — AI Guardrails",

      sub:
        "Company project: safety and validation layer around an LLM service.",

      flow: [
        "REQUEST",
        "FASTAPI",
        "VALIDATION",
        "GUARDRAIL",
        "DECISION",
        "OBSERVABILITY"
      ],

      problem:
        "An LLM-backed service needs validation, safety checks and observability before it becomes dependable in a real workflow.",

      approach:
        "Integrated FastAPI APIs with Amazon Bedrock Guardrails alongside validation, health checks, structured logging and request correlation.",

      architecture:
        "Request → validation → guardrail checks → decision → response, with observability throughout.",

      tech: [
        "Python",
        "FastAPI",
        "Amazon Bedrock Guardrails",
        "DynamoDB",
        "AWS Lambda",
        "IAM",
        "CloudWatch"
      ],

      outcome:
        "A production-oriented AI safety workflow while keeping proprietary implementation details private.",

      lesson:
        "AI safety is also disciplined API design, validation and observability — not only model configuration.",

      link: null
    },


    itticket: {
      kicker:
        "05 / AZURE AI / CURRENT",

      title:
        "IT Support Ticket Intelligence Agent",

      sub:
        "Current implementation combining knowledge retrieval, durable workflows and containerized Azure services.",

      flow: [
        "TICKET",
        "INGEST",
        "KNOWLEDGE",
        "REASON",
        "WORKFLOW",
        "ACTION"
      ],

      problem:
        "Support tickets often require retrieving the right organizational knowledge, coordinating multiple steps and producing consistent outcomes.",

      approach:
        "Working with Azure knowledge/retrieval components, Blob Storage, Durable Functions, Durable Task Scheduler and Container Apps as part of an end-to-end ticket intelligence system.",

      architecture:
        "Ticket/data ingestion → knowledge retrieval → agent reasoning → durable orchestration → service action, with cloud components separated by responsibility.",

      tech: [
        "Azure AI",
        "Knowledge Base",
        "Azure Blob Storage",
        "Durable Functions",
        "Durable Task Scheduler",
        "Container Apps"
      ],

      outcome:
        "A hands-on Azure implementation focused on understanding how AI retrieval, durable orchestration and cloud services work together.",

      lesson:
        "Useful AI applications depend as much on workflow architecture and infrastructure boundaries as on the model itself.",

      link:
        "https://github.com/sowmya13531/Azure-AI.git"
    },


    voiceai: {
      kicker:
        "06 / OFFLINE VOICE AI",

      title:
        "LLaMA-Powered Offline Voice AI Assistant",

      sub:
        "Privacy-first voice assistant running a local LLaMA model.",

      flow: [
        "SPEECH",
        "STT",
        "MEMORY",
        "LLAMA",
        "RESPONSE",
        "TTS",
        "VOICE"
      ],

      problem:
        "A voice assistant can be useful without sending user interaction to a remote inference service.",

      approach:
        "Built an offline voice pipeline around local speech processing, LLaMA 3.2 through Ollama and text-to-speech.",

      architecture:
        "Speech input → transcription → local model inference → response generation → speech synthesis.",

      tech: [
        "Python",
        "LLaMA 3.2",
        "Ollama",
        "STT",
        "TTS",
        "Local Inference"
      ],

      outcome:
        "A privacy-oriented local assistant demonstrating an end-to-end voice AI pipeline.",

      lesson:
        "Local inference makes latency, privacy and model-resource tradeoffs tangible at the application layer.",

      link:
        "https://github.com/sowmya13531/LLaMA-powered-VoiceAI.git"
    },


    yolo: {
      kicker:
        "07 / COMPUTER VISION",

      title:
        "Object Detection with YOLOv4",

      sub:
        "Real-time multi-object detection using YOLOv4 and OpenCV.",

      flow: [
        "IMAGE",
        "PREPROCESS",
        "YOLOv4",
        "DETECTION",
        "BOXES",
        "LABELS"
      ],

      problem:
        "Real-time vision systems need a practical balance between detection capability and inference speed.",

      approach:
        "Implemented object detection using YOLOv4 and OpenCV for image/video processing and bounding-box visualization.",

      architecture:
        "Image/video frame → preprocessing → YOLOv4 inference → bounding boxes → class labels.",

      tech: [
        "Python",
        "YOLOv4",
        "OpenCV",
        "NumPy",
        "Computer Vision"
      ],

      outcome:
        "A working computer-vision pipeline for real-time multi-object detection.",

      lesson:
        "Model selection is only one part of a usable vision system; preprocessing and inference flow matter as well.",

      link:
        "https://github.com/sowmya13531/Object-Detection-Yolo.git"
    }
  };


  /* ============================================================
     Project Modal
     ============================================================ */

  const modal =
    document.getElementById(
      "modalLayer"
    );

  const content =
    document.getElementById(
      "modalContent"
    );

  const close =
    document.getElementById(
      "modalClose"
    );

  const backdrop =
    document.getElementById(
      "modalBackdrop"
    );


  const esc = value =>
    String(value).replace(
      /[&<>"']/g,
      character =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        })[character]
    );


  const section = (title, value) =>
    `<div class="modal-section">
      <h4>${esc(title)}</h4>
      <p>${esc(value)}</p>
    </div>`;


  function openProject(key) {
    const project =
      projects[key];

    if (
      !project ||
      !modal ||
      !content
    ) {
      return;
    }


    content.innerHTML = `
      <div class="modal-kicker">
        ${esc(project.kicker)}
      </div>

      <h3
        class="modal-title"
        id="modalTitle"
      >
        ${esc(project.title)}
      </h3>

      <p class="modal-sub">
        ${esc(project.sub)}
      </p>

      <div class="modal-flow">
        ${project.flow
          .map(
            item =>
              `<span>${esc(item)}</span>`
          )
          .join("")}
      </div>

      ${section(
        "THE PROBLEM",
        project.problem
      )}

      ${section(
        "THE APPROACH",
        project.approach
      )}

      ${section(
        "SYSTEM TOPOLOGY",
        project.architecture
      )}

      <div class="modal-section">
        <h4>
          ENGINEERING SURFACE
        </h4>

        <div class="modal-tags">
          ${project.tech
            .map(
              item =>
                `<span>${esc(item)}</span>`
            )
            .join("")}
        </div>
      </div>

      ${section(
        "OUTCOME",
        project.outcome
      )}

      ${section(
        "ENGINEERING TAKEAWAY",
        project.lesson
      )}

      ${
        project.link
          ? `
            <a
              class="modal-link"
              href="${esc(project.link)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              View source on GitHub ↗
            </a>
          `
          : `
            <span class="modal-link private-project">
              Private / work implementation
            </span>
          `
      }
    `;


    modal.classList.add("open");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "modal-open"
    );

    close?.focus();

    Analytics.send(
      "PROJECT_DETAIL_OPENED",
      key
    );
  }


  function closeProject() {
    modal?.classList.remove(
      "open"
    );

    modal?.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "modal-open"
    );
  }


  document
    .querySelectorAll("[data-project]")
    .forEach(card => {
      card.addEventListener(
        "click",
        () =>
          openProject(
            card.dataset.project
          )
      );
    });


  close?.addEventListener(
    "click",
    closeProject
  );

  backdrop?.addEventListener(
    "click",
    closeProject
  );


  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape" &&
        modal?.classList.contains(
          "open"
        )
      ) {
        closeProject();
      }
    }
  );


  /* ============================================================
     Prevent GitHub Links from Opening Project Modal
     ============================================================ */

  document
    .querySelectorAll(
      ".project-card .open-project[href]"
    )
    .forEach(link => {
      link.addEventListener(
        "click",
        event => {
          event.stopPropagation();
        }
      );
    });


  /* ============================================================
     Neural Background
     ============================================================ */

  const canvas =
    document.getElementById(
      "neuralCanvas"
    );

  const ctx =
    canvas?.getContext("2d");

  let width = 0;
  let height = 0;
  let nodes = [];
  let visible = true;


  const pointer = {
    x: -1000,
    y: -1000,
    active: false
  };


  function resizeCanvas() {
    if (!canvas || !ctx) return;

    const d =
      Math.min(
        devicePixelRatio || 1,
        1.5
      );

    width = innerWidth;
    height = innerHeight;

    canvas.width =
      Math.floor(width * d);

    canvas.height =
      Math.floor(height * d);

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    ctx.setTransform(
      d,
      0,
      0,
      d,
      0,
      0
    );


    const count =
      width < 600
        ? 25
        : width < 1000
          ? 40
          : 58;


    nodes = Array.from(
      { length: count },
      () => ({
        x:
          Math.random() *
          width,

        y:
          Math.random() *
          height,

        vx:
          (Math.random() - 0.5) *
          0.10,

        vy:
          (Math.random() - 0.5) *
          0.10,

        r:
          0.7 +
          Math.random() * 1.1,

        p:
          Math.random() *
          6.28,

        a:
          Math.random()
      })
    );
  }


  function draw() {
    if (
      !canvas ||
      !ctx ||
      reduced ||
      !visible
    ) {
      return;
    }


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;
      node.p += 0.009;


      if (
        node.x < -20 ||
        node.x > width + 20
      ) {
        node.vx *= -1;
      }


      if (
        node.y < -20 ||
        node.y > height + 20
      ) {
        node.vy *= -1;
      }


      if (pointer.active) {
        const dx =
          pointer.x - node.x;

        const dy =
          pointer.y - node.y;

        const d =
          Math.hypot(dx, dy);


        if (
          d < 160 &&
          d > 0
        ) {
          node.x -=
            dx * 0.0005;

          node.y -=
            dy * 0.0005;
        }
      }
    });


    for (
      let i = 0;
      i < nodes.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < nodes.length;
        j++
      ) {
        const a = nodes[i];
        const b = nodes[j];

        const d =
          Math.hypot(
            a.x - b.x,
            a.y - b.y
          );


        if (d < 120) {
          ctx.strokeStyle =
            `rgba(72,148,255,${
              (1 - d / 120) *
              0.085
            })`;

          ctx.lineWidth = 0.6;

          ctx.beginPath();

          ctx.moveTo(
            a.x,
            a.y
          );

          ctx.lineTo(
            b.x,
            b.y
          );

          ctx.stroke();
        }
      }
    }


    nodes.forEach(node => {
      const p =
        (Math.sin(node.p) + 1) /
        2;

      ctx.fillStyle =
        `rgba(56,217,255,${
          0.10 + p * 0.18
        })`;

      ctx.beginPath();

      ctx.arc(
        node.x,
        node.y,
        node.r + p * 0.35,
        0,
        Math.PI * 2
      );

      ctx.fill();
    });


    requestAnimationFrame(draw);
  }


  if (canvas && ctx) {
    resizeCanvas();

    addEventListener(
      "resize",
      resizeCanvas,
      { passive: true }
    );


    addEventListener(
      "mousemove",
      event => {
        pointer.x =
          event.clientX;

        pointer.y =
          event.clientY;

        pointer.active = true;
      },
      { passive: true }
    );


    addEventListener(
      "mouseleave",
      () => {
        pointer.active = false;
      }
    );


    document.addEventListener(
      "visibilitychange",
      () => {
        visible =
          !document.hidden;

        if (
          visible &&
          !reduced
        ) {
          requestAnimationFrame(
            draw
          );
        }
      }
    );


    if (!reduced) {
      requestAnimationFrame(draw);
    }
  }


  /* ============================================================
     Anchor Tracking
     ============================================================ */

  const milestones = [
    25,
    50,
    75,
    100
  ];

  const reached = {};


  addEventListener(
    "scroll",
    () => {
      const max =
        document.documentElement
          .scrollHeight -
        innerHeight;

      if (max <= 0) return;

      const p =
        Math.round(
          (scrollY / max) * 100
        );


      milestones.forEach(
        milestone => {
          if (
            p >= milestone &&
            !reached[milestone]
          ) {
            reached[milestone] =
              true;

            Analytics.send(
              "SCROLL_MILESTONE",
              milestone
            );
          }
        }
      );
    },
    { passive: true }
  );


  if (
    "IntersectionObserver" in
    window
  ) {
    document
      .querySelectorAll(
        "section[id]"
      )
      .forEach(section => {
        let viewed = false;


        new IntersectionObserver(
          entries =>
            entries.forEach(
              entry => {
                if (
                  entry.isIntersecting &&
                  !viewed
                ) {
                  viewed = true;

                  Analytics.send(
                    "SECTION_VIEWED",
                    section.id
                  );
                }
              }
            ),
          {
            threshold: 0.3
          }
        ).observe(section);
      });
  }


  /* ============================================================
     External Links
     ============================================================ */

  document
    .querySelectorAll(
      "a[href^='http']"
    )
    .forEach(a => {
      const href =
        a.getAttribute("href");

      if (
        href &&
        !href.startsWith(
          location.origin
        )
      ) {
        a.target = "_blank";

        a.rel =
          "noopener noreferrer";
      }
    });


  /* ============================================================
     Page State
     ============================================================ */

  document.documentElement
    .classList.add(
      "js-ready"
    );

  document.body
    .classList.add(
      "page-loaded"
    );


  /* ============================================================
     Global Portfolio API
     ============================================================ */

  window.SowmyaPortfolio = {
    Analytics,
    projects,
    stackData
  };

})();
