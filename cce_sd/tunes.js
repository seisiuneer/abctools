// Populate the selector with options from JSON
document.addEventListener('DOMContentLoaded', () => {
    const tuneSelector = document.getElementById('tuneSelector');
    const tuneFrame = document.getElementById('tuneFrame');

    tunes.forEach(tune => {
        const option = document.createElement('option');
        option.value = tune.URL;
        option.textContent = tune.Name;
        tuneSelector.appendChild(option);
    });

    // Update iframe src when an option is selected
    tuneSelector.addEventListener('change', () => {
        tuneFrame.src = tuneSelector.value;
    });
});