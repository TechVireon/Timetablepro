(function () {
  const toggle = document.getElementById("campusToggle");
  if (!toggle) return;

  const area = document.getElementById("campusArea");
  const list = document.getElementById("campusList");
  const addBtn = document.getElementById("addCampusBtn");
  const saveBtn = document.getElementById("saveCampusesBtn");
  const msg = document.getElementById("campusSaveMsg");
  const startInput = document.getElementById("startTime");
  const oldTimingCard = startInput ? startInput.closest(".card-panel") : null;

  function isOn(button) {
    return button.getAttribute("aria-checked") === "true";
  }

  function setSwitch(button, on) {
    button.setAttribute("aria-checked", on ? "true" : "false");
  }

  function showMessage(text, isError) {
    msg.textContent = text;
    msg.className = isError ? "campus-msg error" : "campus-msg";
  }

  function setCampusesEnabled(on) {
    setSwitch(toggle, on);
    area.style.display = on ? "block" : "none";
    if (oldTimingCard) oldTimingCard.style.display = on ? "none" : "";
    if (on && list.children.length === 0) addCampus();
  }

  function addCampus(data) {
    const d = data || {};
    const box = document.createElement("div");
    box.className = "campus-box";
    box.innerHTML = `
      <div class="campus-head">
        <input type="text" class="campus-name" placeholder="Campus name (e.g. Main Campus)" />
        <button type="button" class="campus-remove" aria-label="Remove campus">×</button>
      </div>
      <div class="campus-grid">
        <label>
          <span>Start time</span>
          <input type="time" class="campus-start" />
        </label>
        <label>
          <span>Period length (minutes)</span>
          <input type="number" class="campus-length" min="10" max="180" />
        </label>
      </div>
      <div class="campus-switch-row">
        <strong>Include a break</strong>
        <button type="button" class="campus-switch campus-break" role="switch" aria-checked="true" aria-label="Include a break"></button>
      </div>
      <div class="campus-break-options">
        <div class="campus-grid">
          <label>
            <span>Break after which period?</span>
            <input type="number" class="campus-break-after" min="1" max="10" />
          </label>
          <label>
            <span>Break length (minutes)</span>
            <input type="number" class="campus-break-length" min="5" max="90" />
          </label>
          <label>
            <span>Period length after break (minutes)</span>
            <input type="number" class="campus-length-after" min="10" max="180" />
          </label>
        </div>
      </div>
    `;

    box.querySelector(".campus-name").value = d.name || "";
    box.querySelector(".campus-start").value = d.start_time || "08:00";
    box.querySelector(".campus-length").value = d.period_length || 40;
    box.querySelector(".campus-break-after").value = d.break_after || 4;
    box.querySelector(".campus-break-length").value = d.break_length || 30;
    box.querySelector(".campus-length-after").value = d.period_length_after || d.period_length || 40;

    const breakBtn = box.querySelector(".campus-break");
    const breakOptions = box.querySelector(".campus-break-options");
    const breakOn = d.break_enabled !== false;
    setSwitch(breakBtn, breakOn);
    breakOptions.style.display = breakOn ? "block" : "none";

    breakBtn.addEventListener("click", function () {
      const on = !isOn(breakBtn);
      setSwitch(breakBtn, on);
      breakOptions.style.display = on ? "block" : "none";
    });

    box.querySelector(".campus-remove").addEventListener("click", function () {
      if (confirm("Remove this campus?")) box.remove();
    });

    list.appendChild(box);
  }

  function collectCampuses() {
    const result = [];
    const seen = {};
    const boxes = list.querySelectorAll(".campus-box");

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const name = box.querySelector(".campus-name").value.trim();
      if (!name) return { error: "Please give every campus a name." };
      if (seen[name.toLowerCase()]) return { error: "Two campuses have the same name: " + name };
      seen[name.toLowerCase()] = true;

      const startTime = box.querySelector(".campus-start").value;
      const length = parseInt(box.querySelector(".campus-length").value);
      if (!startTime || !(length > 0)) {
        return { error: "Please set a start time and period length for " + name + "." };
      }

      const breakOn = isOn(box.querySelector(".campus-break"));
      const breakAfter = parseInt(box.querySelector(".campus-break-after").value);
      const breakLength = parseInt(box.querySelector(".campus-break-length").value);
      const lengthAfter = parseInt(box.querySelector(".campus-length-after").value);
      if (breakOn && !(breakAfter > 0 && breakLength > 0 && lengthAfter > 0)) {
        return { error: "Please fill in the break details for " + name + "." };
      }

      result.push({
        name: name,
        start_time: startTime,
        period_length: length,
        break_enabled: breakOn,
        break_after: breakAfter > 0 ? breakAfter : 4,
        break_length: breakLength > 0 ? breakLength : 30,
        period_length_after: breakOn ? lengthAfter : length
      });
    }

    if (result.length === 0) return { error: "Please add at least one campus." };
    return { campuses: result };
  }

  toggle.addEventListener("click", function () {
    setCampusesEnabled(!isOn(toggle));
  });

  addBtn.addEventListener("click", function () {
    addCampus();
  });

  saveBtn.addEventListener("click", async function () {
    const on = isOn(toggle);
    const payload = { campuses_enabled: on };

    if (on) {
      const out = collectCampuses();
      if (out.error) {
        showMessage(out.error, true);
        return;
      }
      payload.campuses = out.campuses;
    }

    const { error } = await supabaseClient.auth.updateUser({ data: payload });
    showMessage(error ? "Could not save: " + error.message : "Saved!", !!error);
  });

  (async function loadSaved() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const meta = session.user.user_metadata || {};
    const saved = Array.isArray(meta.campuses) ? meta.campuses : [];
    saved.forEach(function (c) { addCampus(c); });
    setCampusesEnabled(meta.campuses_enabled === true);
  })();
})();