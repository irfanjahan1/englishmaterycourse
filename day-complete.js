/**
 * day-complete.js
 * Include this script in every day HTML file (1.html, 2.html, ... 60.html).
 *
 * It provides:
 *   1. markDayComplete(dayNum)  — saves the day as done in localStorage
 *   2. getDaysCompleted()       — returns the count of completed days from localStorage
 *   3. getCompletedDays()       — returns the full array of completed day numbers
 *   4. submitAndDownload(dayNum, captureSelector)
 *         — marks the day complete, updates progress, then downloads a
 *           screenshot of the element matching captureSelector (or the
 *           full body if omitted) as a PNG image.
 *
 * How to use in each day file:
 *   <script src="day-complete.js"></script>
 *   ...
 *   <button onclick="submitAndDownload(1)">Submit &amp; Download Image</button>
 *
 * The dayNum MUST match the file number (1 for 1.html, 2 for 2.html, etc.)
 */

(function () {

  /* ── helpers ── */
  function getCompleted() {
    try { return JSON.parse(localStorage.getItem('emc_completed_days') || '[]'); }
    catch (e) { return []; }
  }

  function saveCompleted(arr) {
    try { localStorage.setItem('emc_completed_days', JSON.stringify(arr)); }
    catch (e) { /* storage unavailable */ }
  }

  /* ── public API ── */

  /**
   * Returns the full array of completed day numbers.
   * @returns {number[]}
   */
  window.getCompletedDays = function () {
    return getCompleted();
  };

  /**
   * Returns the count of completed days from localStorage.
   * Use this to initialise daysCompleted in each day file instead of
   * hardcoding a number, so progress persists across page loads.
   * @returns {number}
   */
  window.getDaysCompleted = function () {
    return getCompleted().length;
  };

  /**
   * Mark a day as completed.
   * @param {number} dayNum  The day number (1–60).
   */
  window.markDayComplete = function (dayNum) {
    dayNum = parseInt(dayNum, 10);
    if (!dayNum || isNaN(dayNum)) return;
    var completed = getCompleted();
    if (completed.indexOf(dayNum) === -1) {
      completed.push(dayNum);
      saveCompleted(completed);
    }
  };

  /**
   * Mark the day complete, then download a screenshot of the page (or a
   * specific element) as a PNG image.  Requires html2canvas to be loaded.
   *
   * @param {number} dayNum           The day number (1–60).
   * @param {string} [captureSelector] Optional CSS selector for the element
   *                                   to screenshot.  Defaults to document.body.
   */
  window.submitAndDownload = function (dayNum, captureSelector) {
    dayNum = parseInt(dayNum, 10);

    /* 1. Mark complete */
    window.markDayComplete(dayNum);

    /* 2. Visual feedback on the button */
    var btn = document.getElementById('day-complete-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '✓ Day ' + dayNum + ' Completed!';
      btn.style.background = 'linear-gradient(135deg,#22883f,#28a870)';
      btn.style.color = '#fff';
    }

    /* 3. Download screenshot */
    var target = captureSelector
      ? document.querySelector(captureSelector)
      : document.body;
    if (!target) target = document.body;

    if (typeof html2canvas === 'function') {
      html2canvas(target, { useCORS: true, scale: 2 }).then(function (canvas) {
        var link = document.createElement('a');
        link.download = 'Day' + dayNum + '-Certificate.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(function () {
        alert('Screenshot failed. Day ' + dayNum + ' has been marked as complete!');
      });
    } else {
      /* html2canvas not loaded — just confirm completion */
      alert('Day ' + dayNum + ' marked as complete! (Install html2canvas to enable image download)');
    }
  };

  /**
   * Automatically sync daysCompleted in the host page once the DOM is ready.
   * Each day file declares `let daysCompleted = <hardcoded>` — this override
   * replaces that value with the real localStorage count so progress is
   * accurate across all day files without editing each one individually.
   */
  document.addEventListener('DOMContentLoaded', function () {
    var real = getCompleted().length;
    // Only update if the page declared daysCompleted and real count is higher
    if (typeof window.daysCompleted !== 'undefined' && real > window.daysCompleted) {
      window.daysCompleted = real;
    }
  });

})();
