/*
	Premium GSAP logo shrink interaction
	-----------------------------------
	Goal:
	- Start with a very large centered logo/name.
	- On scroll, shrink + move it upward into the sticky navbar logo position.
	- Lock perfectly into place using GPU-friendly transforms (x/y/scale only).

	Implementation notes:
	- We animate a floating, fixed-position element (#floatLogo).
	- We crossfade into the real navbar logo (#navLogo) at the end to make it
	  “become part of the navbar” without layout thrash.
	- All motion is ScrollTrigger scrubbed for Apple-like smoothness.
*/

(() => {
	const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
	const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false;

	const root = document.documentElement;
	const navbar = document.getElementById("navbar");
	const floatLockup = document.getElementById("floatLockup");
	const navLockup = document.getElementById("navLockup");
	const hero = document.getElementById("hero");
	const heroContent = document.getElementById("heroContent");

	if (!navbar || !floatLockup || !navLockup || !hero) return;

	const mobileMq = window.matchMedia("(max-width: 640px)");
	const updateViewportClass = () => {
		root.classList.toggle("is-mobile", mobileMq.matches);
	};
	updateViewportClass();
	mobileMq.addEventListener?.("change", updateViewportClass);

	function isMobileViewport() {
		return mobileMq.matches;
	}

	function setPointerVars(x, y) {
		root.style.setProperty("--px", `${x}px`);
		root.style.setProperty("--py", `${y}px`);
	}

	// Lightweight “spotlight” pointer vars (used by CSS masks/backgrounds).
	function initPointer() {
		const startX = window.innerWidth / 2;
		const startY = window.innerHeight * 0.3;
		setPointerVars(startX, startY);
		if (!finePointer) return;

		let raf = 0;
		let tx = startX;
		let ty = startY;
		let cx = tx;
		let cy = ty;

		function tick() {
			raf = 0;
			cx += (tx - cx) * 0.16;
			cy += (ty - cy) * 0.16;
			setPointerVars(cx, cy);
			if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.2) raf = requestAnimationFrame(tick);
		}

		window.addEventListener(
			"pointermove",
			(e) => {
				tx = e.clientX;
				ty = e.clientY;
				if (!raf) raf = requestAnimationFrame(tick);
			},
			{ passive: true }
		);
	}

	function initPremiumMotion() {
		if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

		// Classic intro blocks — entrance after the logo pin section
		const classicHero = document.querySelector(".classic .hero-left");
		const classicPhoto = document.querySelector(".classic .photo-card");
		if (classicHero || classicPhoto) {
			gsap.from([classicHero, classicPhoto].filter(Boolean), {
				opacity: 0,
				y: 36,
				duration: 1,
				ease: "power3.out",
				stagger: 0.14,
				scrollTrigger: {
					trigger: ".classic",
					start: "top 82%",
					toggleActions: "play none none reverse",
				},
			});
		}

		// Section titles — slide + gradient line draw
		gsap.utils.toArray(".section__head").forEach((head) => {
			const title = head.querySelector("h2");
			const line = head.querySelector(".section__line");
			const desc = head.querySelector("p");
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: head,
					start: "top 88%",
					toggleActions: "play none none reverse",
				},
			});

			if (title) {
				tl.from(title, { opacity: 0, x: -32, duration: 0.8, ease: "power3.out" });
			}
			if (line) {
				tl.from(line, { scaleX: 0, opacity: 0, duration: 0.65, ease: "power2.out" }, "-=0.45");
			}
			if (desc) {
				tl.from(desc, { opacity: 0, y: 14, duration: 0.55, ease: "power2.out" }, "-=0.35");
			}
		});

		// Project cards — staggered cascade
		gsap.utils.toArray(".grid--projects").forEach((grid) => {
			const cards = grid.querySelectorAll(".card--project");
			if (!cards.length) return;

			gsap.from(cards, {
				opacity: 0,
				y: 40,
				duration: 0.8,
				ease: "power3.out",
				stagger: {
					amount: 0.5,
					from: "start",
				},
				scrollTrigger: {
					trigger: grid,
					start: "top 80%",
					toggleActions: "play none none reverse",
				},
				onComplete: () => gsap.set(cards, { clearProps: "transform" }),
			});
		});

		// Languages — scale-in grid
		gsap.utils.toArray(".grid--languages").forEach((grid) => {
			const cards = grid.querySelectorAll(".card--language");
			if (!cards.length) return;

			gsap.from(cards, {
				opacity: 0,
				scale: 0.92,
				y: 28,
				duration: 0.75,
				ease: "back.out(1.2)",
				stagger: 0.12,
				scrollTrigger: {
					trigger: grid,
					start: "top 82%",
					toggleActions: "play none none reverse",
				},
			});
		});

		// Certificates — scale-in grid
		gsap.utils.toArray(".grid--certs").forEach((grid) => {
			const cards = grid.querySelectorAll(".card--cert");
			if (!cards.length) return;

			gsap.from(cards, {
				opacity: 0,
				scale: 0.92,
				y: 28,
				duration: 0.75,
				ease: "back.out(1.2)",
				stagger: 0.12,
				scrollTrigger: {
					trigger: grid,
					start: "top 82%",
					toggleActions: "play none none reverse",
				},
			});
		});

		// Remaining cards (education, skills, contact)
		gsap.utils.toArray(".reveal").forEach((el) => {
			gsap.fromTo(
				el,
				{ opacity: 0, y: 22 },
				{
					opacity: 1,
					y: 0,
					duration: 0.85,
					ease: "power2.out",
					scrollTrigger: {
						trigger: el,
						start: "top 86%",
						toggleActions: "play none none reverse",
					},
				},
			);
		});

		// Skills chips — playful pop
		const skillChips = document.querySelectorAll("#skills .chip");
		if (skillChips.length) {
			gsap.from(skillChips, {
				opacity: 0,
				scale: 0.82,
				y: 10,
				duration: 0.5,
				ease: "back.out(2)",
				stagger: 0.03,
				scrollTrigger: {
					trigger: "#skills",
					start: "top 75%",
					toggleActions: "play none none reverse",
				},
			});
		}

		// Navbar — subtle compact state on scroll (after logo lands)
		ScrollTrigger.create({
			trigger: hero,
			start: "bottom top+=72",
			onEnter: () => navbar.classList.add("navbar--scrolled"),
			onLeaveBack: () => navbar.classList.remove("navbar--scrolled"),
		});

		// Nav link hover micro-interaction
		if (finePointer) {
			gsap.utils.toArray(".navlinks__link").forEach((link) => {
				link.addEventListener("mouseenter", () => {
					gsap.to(link, { y: -2, scale: 1.03, duration: 0.22, ease: "power2.out" });
				});
				link.addEventListener("mouseleave", () => {
					gsap.to(link, { y: 0, scale: 1, duration: 0.28, ease: "power2.out" });
				});
			});
		}
	}

	function initGSAP() {
		if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
			console.warn("GSAP or ScrollTrigger not found. Check script includes.");
			return;
		}

		// Respect reduced-motion: keep a premium static layout without scroll animation.
		if (reduceMotion) {
			gsap.set(navLockup, { opacity: 1 });
			gsap.set(floatLockup, { opacity: 0 });
			if (heroContent) gsap.set(heroContent, { opacity: 1, y: 0 });
			gsap.set([".section__head h2", ".section__line", ".card--project", ".card--cert", ".reveal"], {
				clearProps: "all",
			});
			return;
		}

		gsap.registerPlugin(ScrollTrigger);
		ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });
		// Reduce perceived stutter on some machines by not trying to "catch up".
		gsap.ticker.lagSmoothing(0);

		function getStartScale() {
			const w = window.innerWidth;
			// Mobile: smaller hero lockup so it fits comfortably on narrow screens.
			if (isMobileViewport()) {
				return Math.min(1.7, Math.max(1.25, w / 220));
			}
			return Math.min(3.4, Math.max(2.1, w / 340));
		}

		function getPinScrollDistance() {
			if (isMobileViewport()) {
				return Math.round(window.innerHeight * 0.5);
			}
			return Math.round(window.innerHeight * 0.65);
		}

		function getEndScale() {
			// Keep the end state fully visible on mobile and desktop.
			return 1;
		}

		// Initial visual state
		gsap.set(navLockup, { opacity: 0 });
		if (heroContent) gsap.set(heroContent, { opacity: 0, y: 14 });
		gsap.set(floatLockup, {
			opacity: 1,
			xPercent: -50,
			yPercent: -50,
			x: 0,
			y: 0,
			scale: getStartScale(),
			willChange: "transform,opacity",
		});

		const state = { dx: 0, dy: 0, startScale: getStartScale() };

		function measure() {
			state.startScale = getStartScale();

			// Ensure we measure from the true start pose
			gsap.set(floatLockup, {
				xPercent: -50,
				yPercent: -50,
				x: 0,
				y: 0,
				scale: state.startScale,
				opacity: 1,
			});
			gsap.set(navLockup, { opacity: 0 });

			const from = floatLockup.getBoundingClientRect();
			const to = navLockup.getBoundingClientRect();

			const fromCx = from.left + from.width / 2;
			const fromCy = from.top + from.height / 2;
			const toCx = to.left + to.width / 2;
			const toCy = to.top + to.height / 2;

			state.dx = toCx - fromCx;
			state.dy = toCy - fromCy;
		}

		// Create the main scrubbed timeline
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: hero,
				start: "top top",
				// Keep the pinned range tight so you don't scroll through empty space.
				end: () => `+=${getPinScrollDistance()}`,
				// Using a long scrub value can feel like "lag" because animation intentionally trails scroll.
				// Keep it tight but still premium-smooth.
				scrub: () => (isMobileViewport() ? 0.14 : 0.35),
				pin: true,
				anticipatePin: 1,
				invalidateOnRefresh: true,
				onRefreshInit: measure,
			},
		});

		// 1) (Optional) Reveal hero content as scrolling begins
		if (heroContent) {
			tl.to(
				heroContent,
				{
					opacity: 1,
					y: 0,
					ease: "none",
					duration: 0.35,
				},
				0.08
			);
		}

		// 2-4) Move/shrink the floating logo into navbar position
		tl.to(
			floatLockup,
			{
				xPercent: -50,
				yPercent: -50,
				x: () => state.dx,
				y: () => state.dy,
				scale: () => getEndScale(),
				ease: "none",
				duration: 1,
				force3D: true,
			},
			0
		);

		// 4-5) Seamless handoff into the real navbar lockup
		// Crossfade a bit earlier so the floating lockup doesn't sit on top of nav links
		// when users stop scrolling near the end of the pinned range.
		tl.to(
			floatLockup,
			{
				opacity: 0,
				ease: "none",
				duration: 0.15,
			},
			0.85
		);
		tl.to(
			navLockup,
			{
				opacity: 1,
				ease: "none",
				duration: 0.15,
			},
			0.85
		);

		// Keep background static so the page feels like one continuous gradient.

		initPremiumMotion();

		ScrollTrigger.refresh();
		document.fonts?.ready?.then?.(() => ScrollTrigger.refresh());

		let resizeTimer;
		window.addEventListener(
			"resize",
			() => {
				clearTimeout(resizeTimer);
				resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 220);
			},
			{ passive: true },
		);
	}

	function init() {
		initPointer();
		initGSAP();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
