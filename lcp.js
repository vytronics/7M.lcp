/*
Copyright 2014 Vytroncs.com and Charles Weissman

This file is part of "Vytroncs HMI, the 100% Free, Open-Source SCADA/HMI Initiative"
herein referred to as "Vytronics HMI".

Vytronics HMI is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Vytronics HMI is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Vytronics HMI.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
application.js - Vytronics HMI project main application file. The purpose of this file
is to load the vytronics.hmi module, add any custom application modules and code, and then
start the server. Your project.json and wen files go in ./project in this directory or you
can put them somewhere else and set the VYTRONICS_PROJDIR env to point there.
*/

//Load the vytronics.hmi module
//TODO - loading relative path during development of vytronics.hmi module
//until it is published. Also have to hard code package.json to load vytronics.hmi dependencies
var server = require("vytronics.hmi");

//Set logging to debug level
server.log.setLevel('DEBUG');

server.log.info('Starting Vytronics HMI server from application.js');

//Yes, it really is this simple!
server.start();