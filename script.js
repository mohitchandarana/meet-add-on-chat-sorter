// Initialize the Google Meet Add-on SDK
// This is crucial for the add-on to function within Meet
meet.initialize();

document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const sortButton = document.getElementById('sortButton');
    const sortedOutput = document.getElementById('sortedOutput');
    const copyButton = document.getElementById('copyButton');
    const messageBox = document.getElementById('messageBox');

    /**
     * Shows a message in the message box.
     * @param {string} message - The message to display.
     * @param {string} type - The type of message (e.g., 'success', 'error', 'info').
     */
    function showMessage(message, type) {
        messageBox.textContent = message;
        // Reset classes and apply new ones for display and styling
        messageBox.className = 'message-box show';
        if (type === 'success') {
            messageBox.classList.add('bg-green-100', 'text-green-800', 'border-green-300');
        } else if (type === 'error') {
            messageBox.classList.add('bg-red-100', 'text-red-800', 'border-red-300');
        } else { // Default to info
            messageBox.classList.add('bg-blue-100', 'text-blue-800', 'border-blue-300');
        }
        // Hide message after 3 seconds
        setTimeout(() => {
            messageBox.classList.remove('show');
            // Clear text and remove specific styling classes after hiding
            messageBox.textContent = '';
            messageBox.classList.remove('bg-green-100', 'text-green-800', 'border-green-300',
                                     'bg-red-100', 'text-red-800', 'border-red-300',
                                     'bg-blue-100', 'text-blue-800', 'border-blue-300');
        }, 3000);
    }

    /**
     * Sorts the input text based on the third line of every three-line entry.
     * Output format: "Name: Response"
     */
    sortButton.addEventListener('click', () => {
        const inputText = chatInput.value.trim();
        if (!inputText) {
            showMessage('Please paste some messages to sort!', 'error');
            return;
        }

        // Split the input into individual lines
        const lines = inputText.split('\n');

        // Filter out any completely empty lines to avoid issues with indexing
        const nonBlankLines = lines.filter(line => line.trim() !== '');

        // Check if the number of non-blank lines is a multiple of 3
        if (nonBlankLines.length === 0) {
            showMessage('No valid messages found to sort after cleaning.', 'error');
            return;
        }
        if (nonBlankLines.length % 3 !== 0) {
            // Provide a warning but proceed with full entries
            showMessage('Warning: Number of lines is not a multiple of 3. Processing complete 3-line entries, partial entries at end will be ignored.', 'info');
        }

        const entries = [];
        // Group lines into 3-line entries
        for (let i = 0; i + 2 < nonBlankLines.length; i += 3) {
            const name = nonBlankLines[i].trim();         // Line 1: Name
            // const timestamp = nonBlankLines[i + 1];     // Line 2: Timestamp (ignored for output)
            const response = nonBlankLines[i + 2].trim(); // Line 3: Response (sorting key)

            entries.push({
                // Formulate the full entry as "Name: Response"
                formattedEntry: `${name}: ${response}`,
                sortKey: response // Use the response content as the key for sorting
            });
        }

        if (entries.length === 0) {
            showMessage('Could not form complete 3-line entries from the input. Ensure data matches "Name\nTime\nResponse" format.', 'error');
            return;
        }

        // Sort the entries based on their sortKey (the response line), case-insensitive
        entries.sort((a, b) => a.sortKey.localeCompare(b.sortKey, undefined, { sensitivity: 'base' }));

        // Join the sorted entries back into a single string, each on a new line
        sortedOutput.value = entries.map(entry => entry.formattedEntry).join('\n');
        showMessage('Messages sorted successfully!', 'success');
    });

    /**
     * Copies the content of the sortedOutput textarea to the clipboard.
     * Uses document.execCommand('copy') for better compatibility.
     */
    copyButton.addEventListener('click', () => {
        // Check if there's content to copy
        if (!sortedOutput.value.trim()) {
            showMessage('Nothing to copy! Sort messages first.', 'error');
            return;
        }

        // Select the text in the output textarea
        sortedOutput.select();
        sortedOutput.setSelectionRange(0, 99999); // For mobile devices

        try {
            // Execute the copy command
            document.execCommand('copy');
            showMessage('Sorted messages copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers or environments where execCommand is restricted
            showMessage('Failed to copy. Please copy manually.', 'error');
            console.error('Failed to copy text:', err);
        }
    });
});
