/**
 * BigV Stats Downloader
 * This script downloads player statistics from the Basketball Victoria API.
 * It replicates the functionality of the Python script.
 */

// Player class to match Python implementation
class Player {
    constructor(name = null, team = null, dob = null) {
        this.name = name;
        this.team = team;
        this.dob = dob;
        
        // Initialize all stats fields as null
        const statsFields = [
            'assists', 'assistsDefensive', 'assistsPerGame', 'assistsTurnoverRatio',
            'blocks', 'blocksPerGame', 'blocksReceived', 'blocksReceivedPerGame',
            'doubleDouble', 'draws', 'dunks', 'dunksPerGame', 'efficiency',
            'efficiencyCustom', 'fieldGoalsAttempted', 'fieldGoalsEffectivePercentage',
            'fieldGoalsMade', 'fieldGoalsPercentage', 'foulsCoachDisqualifying',
            'foulsCoachTechnical', 'foulsDisqualifying', 'foulsDrawn', 'foulsDrawnPerGame',
            'foulsOffensive', 'foulsPersonal', 'foulsPersonalPerGame', 'foulsTechnical',
            'foulsTotal', 'foulsUnsportsmanlike', 'freeThrowsAttempted',
            'freeThrowsAttemptedPerGame', 'freeThrowsMade', 'freeThrowsMadePerGame',
            'freeThrowsPercentage', 'games', 'gamesPercentage', 'gamesStarted',
            'indexOfSuccess', 'losses', 'maxAssists', 'maxFreeThrowsMade', 'maxPoints',
            'maxPointsThreeMade', 'maxPointsTwoMade', 'maxRebounds', 'maxReboundsDefensive',
            'maxReboundsOffensive', 'maxSteals', 'minus', 'minutes', 'minutesPerGame',
            'pir', 'plus', 'plusMinus', 'points', 'pointsFastBreak', 'pointsFastBreakAttempted',
            'pointsFastBreakMade', 'pointsFromTurnover', 'pointsInThePaint',
            'pointsInThePaintAttempted', 'pointsInThePaintMade', 'pointsPerGame',
            'pointsSecondChance', 'pointsSecondChanceAttempted', 'pointsSecondChanceMade',
            'pointsThreeAttempted', 'pointsThreeAttemptedPerGame', 'pointsThreeMade',
            'pointsThreeMadePerGame', 'pointsThreePercentage', 'pointsTwoAttempted',
            'pointsTwoAttemptedPerGame', 'pointsTwoMade', 'pointsTwoMadePerGame',
            'pointsTwoPercentage', 'powerPlayPoints', 'powerPlayPointsAwarded', 'rebounds',
            'reboundsDefensive', 'reboundsDefensivePerGame', 'reboundsOffensive',
            'reboundsOffensivePerGame', 'reboundsPerGame', 'steals', 'stealsPerGame',
            'tripleDouble', 'trueShootingAttempts', 'trueShootingPercentage', 'turnovers',
            'turnoversPerGame', 'turnoversPercentage', 'wins'
        ];

        statsFields.forEach(field => {
            this[field] = null;
        });
    }
}

// Competition data
const competitions = {
    1: {"display_value": "Champ Mens", "comp_id": "ee3cafaa-76a3-11eb-a481-2a86bfd2d24d"},
    2: {"display_value": "Div 1 Mens", "comp_id": "ee43298e-76a3-11eb-a481-2a86bfd2d24d"},
    3: {"display_value": "Div 2 Mens", "comp_id": "ee4a0420-76a3-11eb-a481-2a86bfd2d24d"},
    4: {"display_value": "Champ Womens", "comp_id": "ee4035f8-76a3-11eb-a481-2a86bfd2d24d"},
    5: {"display_value": "Div 1 Womens", "comp_id": "ee46747c-76a3-11eb-a481-2a86bfd2d24d"},
    6: {"display_value": "Div 2 Womens", "comp_id": "ee4d24e8-76a3-11eb-a481-2a86bfd2d24d"},
    7: {"display_value": "VCYM", "comp_id": "ee501d7e-76a3-11eb-a481-2a86bfd2d24d"},
    8: {"display_value": "Youth 1 Mens", "comp_id": "ee57fec2-76a3-11eb-a481-2a86bfd2d24d"},
    9: {"display_value": "Youth 2 Mens", "comp_id": "ee615c24-76a3-11eb-a481-2a86bfd2d24d"},
    10: {"display_value": "Youth 3 Mens", "comp_id": "a5809a1b-b1d9-11ef-823f-656618bcf3f0"},
    11: {"display_value": "VCYW", "comp_id": "ee53fe30-76a3-11eb-a481-2a86bfd2d24d"},
    12: {"display_value": "Youth 1 Womens", "comp_id": "ee64436c-76a3-11eb-a481-2a86bfd2d24d"},
    13: {"display_value": "Youth 2 Womens", "comp_id": "ee6709f8-76a3-11eb-a481-2a86bfd2d24d"}
};

// Base API URL
const baseApiUrl = "https://prod.services.nbl.com.au/api_cache/bbv/synergy";

// Initialize the UI
document.addEventListener('DOMContentLoaded', function() {
    initializeCompetitionSelect();
    setupEventListeners();
    updateStatus("Ready to start");
});

function initializeCompetitionSelect() {
    const select = document.getElementById('competitionSelect');
    select.innerHTML = '<option value="">Select a competition</option>';
    
    Object.entries(competitions).forEach(([key, comp]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = comp.display_value;
        select.appendChild(option);
    });
}

function setupEventListeners() {
    document.getElementById('competitionSelect').addEventListener('change', handleCompetitionChange);
    document.getElementById('seasonSelect').addEventListener('change', enableDownloadButton);
    document.getElementById('downloadButton').addEventListener('click', handleDownload);
}

async function handleCompetitionChange() {
    const competitionSelect = document.getElementById('competitionSelect');
    const seasonSelect = document.getElementById('seasonSelect');
    const downloadButton = document.getElementById('downloadButton');
    
    seasonSelect.disabled = true;
    downloadButton.disabled = true;
    
    if (!competitionSelect.value) {
        updateStatus("Please select a competition");
        return;
    }

    try {
        updateStatus("Fetching seasons...");
        const competition = competitions[competitionSelect.value];
        const url = `${baseApiUrl}?route=competitions/${competition.comp_id}/seasons&format=true`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const seasons = data.data
            .map(season => ({
                display_value: season.year.toString(),
                season_id: season.seasonId
            }))
            .sort((a, b) => parseInt(b.display_value) - parseInt(a.display_value));

        populateSeasonSelect(seasons);
        updateStatus("Select a season");
    } catch (error) {
        handleError(error);
    }
}

function populateSeasonSelect(seasons) {
    const select = document.getElementById('seasonSelect');
    select.innerHTML = '<option value="">Select a season</option>';
    
    seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season.season_id;
        option.textContent = season.display_value;
        select.appendChild(option);
    });

    select.disabled = false;
}

function enableDownloadButton() {
    const seasonSelect = document.getElementById('seasonSelect');
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.disabled = !seasonSelect.value;
    
    if (seasonSelect.value) {
        updateStatus("Ready to download");
    }
}

async function handleDownload() {
    const seasonSelect = document.getElementById('seasonSelect');
    const filename = document.getElementById('filename').value.trim() || 'bigv_stats';
    
    // Add .xlsx extension
    const fullFilename = `${filename}.xlsx`;

    try {
        updateStatus("Fetching player statistics...");
        const url = `${baseApiUrl}?route=statistics/for/person/in/seasons/${seasonSelect.value}&limit=1000&include=persons,entities&format=true`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        updateStatus("Processing data...");
        const playerData = formatData(data);
        await generateExcel(playerData, fullFilename);
        updateStatus("Excel file downloaded successfully!");
    } catch (error) {
        handleError(error);
    }
}

function formatData(data) {
    // Create teams lookup
    const teamsLookup = {};
    Object.values(data.includes.resources.entities).forEach(team => {
        teamsLookup[team.entityId] = team.nameFullLocal;
    });

    // Create players dictionary
    const playersDict = {};
    Object.values(data.includes.resources.persons).forEach(player => {
        playersDict[player.personId] = new Player(player.nameFullLocal, null, player.dob);
    });

    // Update player statistics
    data.data.forEach(entry => {
        const player = playersDict[entry.personId];
        player.team = teamsLookup[entry.entityId];

        // Update player statistics
        Object.entries(entry.statistics).forEach(([key, value]) => {
            if (key in player) {
                player[key] = value;
            }
        });
    });

    return playersDict;
}

async function generateExcel(playerData, filename) {
    updateStatus("Generating Excel file...");
    
    // Convert playerData object to array format for Excel
    const players = Object.values(playerData);
    if (players.length === 0) {
        throw new Error("No player data available");
    }

    // Get headers from the first player
    const headers = Object.keys(players[0]);
    
    // Create the worksheet data
    const wsData = [
        headers,
        ...players.map(player => headers.map(header => player[header]))
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, filename);
}

function handleError(error) {
    console.error(error);
    updateStatus(`Error: ${error.message}`, true);
}

function updateStatus(message, isError = false) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = isError ? 'error' : '';
}
