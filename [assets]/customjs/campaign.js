class Campaign {

    constructor() {  // Constructor
        console.log("Creating Campaign");
        this.playerLogs = "uvms-players/logs/";
        this.sessionLogs = "uvms/sessions/";
        this.gmRoot = "uvms";

        this.npcFolders = [
            "uvms/npcs",
            "uvms/spare-npcs"
        ];

        this.locationFolders = [
            "uvms/places",
            "uvms/places/leilon",
            "uvms/places/neverwinter-wood",
            "uvms/places/phandalin"
        ];

        this.monsterSize = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
        this.monsterType = ['Aberration', 'Beast', 'Celestial', 'Construct',
            'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze',
            'Plant', 'Undead'];
    }

    toFriday = (filename) => {
        const titledate = filename.substring(0, 10);
        return moment(titledate).add(1, 'week').day(5);
    }

    lowerKebab = (name) => {
        return name
            .replace(/([a-z])([A-Z])/g, '$1-$2') // separate on camelCase
            .replace(/[\s_]+/g, '-')        // replace all spaces and low dash
            .toLowerCase();                 // convert to lower case
    }

    chooseNpcFolder = async (tp) => {
        const choice = await tp.system.suggester(this.npcFolders, this.npcFolders);
        if (!choice) {
            warn("No choice selected. Using 'uvms/npcs'");
            return 'uvms/npcs';
        }
        return choice;
    }

    chooseLocationFolder = async (tp) => {
        const choice = await tp.system.suggester(this.locationFolders, this.locationFolders);
        if (!choice) {
            warn("No choice selected. Using 'uvms/places'");
            return 'uvms/places';
        }
        return choice;
    }

    chooseTags = async (tp, prefix, value) => {
        let values = [];
        const filter = '#' + prefix;
        for (const itItem of Object.keys(app.metadataCache.getTags())) {
            if (itItem.startsWith(filter)) {
                values.push(itItem.substring(1));
            }
        }
        values.sort();
        values.unshift('--');
        const choice = await tp.system.suggester(values, values);
        if (!choice) {
            console.log(`No choice selected. Using ${value}`);
            return value;
        }
        return choice;
    }

    chooseTagOrEmpty = async (tp, prefix, value) => {
        let result = await this.chooseTags(tp, prefix, value);
        if (result && result != '--') {
            return result;
        }
        return '';
    }

    chooseMonsterType = async (tp) => {
        return await tp.system.suggester(this.monsterType, this.monsterType);
    }

    chooseMonsterSize = async (tp) => {
        return await tp.system.suggester(this.monsterSize, this.monsterSize);
    }

    /**
     * Calculate the next session log
     */
    nextSession = async () => {
        const fileList = await app.vault.adapter.list(this.sessionLogs);
        const files = fileList.files.slice(-4);
        let lastSession = files.pop();
        while (lastSession.contains('Untitled')) {
            lastSession = files.pop();
        }
        const pos = lastSession.lastIndexOf('/') + 1;
        const pos2 = lastSession.lastIndexOf('.');
        const name = lastSession.substring(pos, pos2);
        console.log("%o", name);
        return {
            friday: this.toFriday(name).format("YYYY-MM-DD"),
            lastSession: name
        }
    }

    /**
     * Calculate the next day that should be logged, according to the Harptos calendar.
     * This assumes log files with the following format:
     * - single day:   log-1498-08-09
     * - several days: log-1498-08-09-11
     *
     * This will first look for the last date for which there is a log file
     * - get a list of all files in the log directory
     * - split the filename by '-' and sort out y, m, d (and account for optional additional end day in the same month)
     * - see if this day is the latest so far (y, m, d comparisons)
     *
     * Once it has found the last day.. figure out the _next_ day, with rollover
     * for the year, and insertion of a day 0 for special calendar days.
     */
    nextlog = async () => {
        const fileList = await app.vault.adapter.list(this.playerLogs);
        console.log("%o", fileList);

        let year = 0, month = 0, day = 0;

        for (let x of fileList.files) {
            console.log("file %o", x);
            let segments = x.replace(this.playerLogs, '').replace('\.md', '').split('-');

            if (segments[0] === ("log")) {
                let y = parseInt(segments[1]);
                let m = parseInt(segments[2]);
                let d = parseInt(segments[3]);

                if (segments.length == 5 && Number.isInteger(segments[4])) {
                    d = parseInt(segments[4]);
                }

                if (y > year) {
                    year = y;
                    month = m;
                    day = d;
                } else if (y == year) {
                    if (m > month) {
                        month = m;
                        day = d;
                    } else if (m == month && d > day) {
                        day = d;
                    }
                }
            }
        }

        if (day == 30) {
            switch (month) {
                // New Year
                case 12:
                    year += 1;
                    month = 1;
                    day = 1;
                    break;
                // Special holidays
                case 1:
                case 4:
                case 7:
                case 9:
                case 11:
                    month += 1;
                    day = 0;
                    break;
                // Everything else
                default:
                    month += 1;
                    day = 1;
            }
        } else {
            day += 1;
        }
        console.log("%s %s %s", year, month, day);

        return [`log-${year}-${this.pad(month)}-${this.pad(day)}`,
        `# ${day} ${this.monthName(month, day)} ${year}`]
    }

    /**
     * Add padding to numbers less than 10.
     * Yes, printf could also do this, but whatever.
     */
    pad = (x) => {
        if (x < 10) {
            return '0' + x;
        }
        return x;
    }

    /**
     * Map the month and day to pretty names according to the Harptos Calendar.
     * Day 0 indicates a special day (between months)
     */
    monthName = (m, d) => {
        if (d == 0) {
            switch (m) {
                case 2:
                    return 'Midwinter';
                case 5:
                    return 'Greengrass';
                case 8:
                    return 'Midsummer';
                case 10:
                    return 'Highharvestide';
                case 12:
                    return 'Feast of the Moon';
            }
        }

        switch (m) {
            case 1:
                return 'Hammer';
            case 2:
                return 'Alturiak';
            case 3:
                return 'Ches';
            case 4:
                return 'Tarsakh';
            case 5:
                return 'Mirtul';
            case 6:
                return 'Kythorn';
            case 7:
                return 'Flamerule';
            case 8:
                return 'Elesias';
            case 9:
                return 'Eleint';
            case 10:
                return 'Marpenoth';
            case 11:
                return 'Uktar';
            case 12:
                return 'Nightal';
        }
    }

    /* Sort npcs by a status, where they are, then their name */
    sortNpcs = (n1, n2) => {
        return this.testStatus(n1, n2,
            () => this.testWhere(n1, n2,
                () => this.testName(n1, n2)));
    }

    /* Sort by the status field (or fallback on equals) */
    testStatus = (n1, n2, fallback) => {
        if (n1.status == n2.status) {
            return fallback();
        }
        return n1.status.localeCompare(n2.status);
    }

    /* Sort by the where field (or fallback on equals) */
    testWhere = (n1, n2, fallback) => {
        if (n1.where == n2.where) {
            return fallback();
        }
        return n1.where.localeCompare(n2.where);
    }

    /* Sort by the name field */
    testName = (n1, n2) => {
        return n1.name.localeCompare(n2.name);
    }

    /* Convert iff status into an emoji */
    iffStatus = (iff) => {
        switch (iff) {
            case 'neutral': return '🟦';
            case 'friend': return '🟩';
            case 'enemy': return '🟥';
            default: return '⬜️';
        }
    }

    /* Filter npcs from the given list of pages */
    filterNpcs = (pages) => {
        return pages
            .where(p => p.type == "npc")
            .map(p => {
                var status = 'alive';
                var iff = 'unknown';
                var where = 'unknown';
                var region = 'unknown';
                var affiliation = [];
                p.tags.forEach((tag) => {
                    if (tag.startsWith('iff/')) {
                        iff = tag.substring(4);
                    } else if (tag.startsWith('npc/')) {
                        status = tag.substring(4);
                    } else if (tag.startsWith('place/')) {
                        where = tag.substring(6);
                    } else if (tag.startsWith('region/')) {
                        region = tag.substring(7);
                    } else if (tag.startsWith('group/')) {
                        affiliation.push(tag.substring(6));
                    }
                });
                return {
                    name: p.file.name,
                    link: `[${p.file.aliases[0] ? p.file.aliases[0] : p.file.name}](/${p.file.path})`,
                    status: status,
                    iff: iff,
                    where: where == 'unknown' ? region : where,
                    affiliation: affiliation
                }
            })
            .sort(p => p, 'asc', this.sortNpcs)
            .map(p => [
                p.status == 'alive' ? '⚪️' : '☠️',
                p.link,
                p.where,
                this.iffStatus(p.iff),
                p.affiliation.sort().join(", ")]);
    }
}
