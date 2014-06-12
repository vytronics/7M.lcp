//signalsLCP.js
//Code used in SVG displays of signal system LCP's
//
console.log("Hello from signalLCP.js!!!!");

/*
This script defines signal interlocking specific instrumentation code. The scripts
rely heavily on strict naming conventions to allow multiple tags and logic to be applied via
a single function call given just the signal or switch name etc.

*/


//Some globals
var color_const = {
    gray: '#a39a9a',
    orange: '#fcb500',
    cyan: '#0ffafa',
    yellow: '#ffff00',
    white: '#ffffff',
    green: '#00ff00',
    red: '#ff0000'
};

var lcp_colors = {
    TK_OCC_ON: color_const.orange,
    TK_OCC_OFF: color_const.white,
    SG_CLEAR: color_const.green,
    SG_STOP: color_const.red,
    TM_LOK_ON: color_const.cyan,
    INHIBIT_ON: color_const.cyan,
    INHIBIT_OFF: color_const.gray,
    TM_LOK_OFF: color_const.gray,
    TF_DIR_ON: color_const.yellow,
    TF_DIR_OFF: color_const.gray,
    BACKGROUND: '#666666'
};

/*============ Document stuff=================*/
//Setup the page and parse. This is called at the end of this script file.
function instrument_lcp() {
    var i;
    
    var elem = document.documentElement;
    
    vyhmi.scale_fit_svg(elem,color_const.BACKGROUND);
    
    //Define the element classes to instrument and the function to call to do it
    var instrument_classes = {
        'switch': instr_switch,
        'signal': instr_signal,
        'traffic': instr_traffic,
        'track': instr_track,
        'holdout_signal': instr_holdout_signal
    };
    
    Object.getOwnPropertyNames(instrument_classes).forEach( function (class_name){
        var elems = elem.getElementsByClassName(class_name);
        for (var i=0; i<elems.length; i++){
            instrument_classes[class_name](elems[i]);
        }
    });
}



/*============ TRACK STUFF ====================
Non interlocking tracks are just paths with class="track" and id=TKXX

Tracks in the interlocking are part of the switch graphic group

*/
function instr_track(elem) {
    var tagid = elem.id + '.IND';
    vyhmi.poke_style(elem,tagid,'stroke',[lcp_colors.TK_OCC_OFF, lcp_colors.TK_OCC_ON]);    
}

/*============== SWITCH STUFF ====================
        
Switch graphic group
--------------------
Switches are the most complex graphics group. They contain switch points, switch tracks, a click
select area etc.

group id=SWxx.TKxxx.SWxx class="switch" - A group that holds all the peices of the switch for
            |    |    |
    The switch   |    |
        switch track  |
                    other switch on track

    path class="swn-point" - The switch normal point
    path class="swr-point" - The switch reverse point
    tspan class="sw-lock" - The switch lock indicator
    path class="swr-tk" - The track on the reverse point
    path class="swn-tk" - The track on the normal point
    path class="trail-tk - The trailing track for the switch
    rect class="click" - The click area

Tag name conventions
---------------------
        
    Switch Name - SWXX
        SWXX.NOR.IND
        SWXX.REV.IND
        SWXX.NOR.CTL
        SWXX.REV.CTL
        SWXX.LK.IND
        TK.XXTKE.IND
*/
function instr_switch (elem){
    //Indication memory
    var inds = {
        swn_i:undefined,
        swr_i:undefined,
        tk_i:undefined,
        sw_lk_i:undefined,
        trail_swn_i:undefined
    };
        
    //Get tag names    
    var ids = elem.getAttribute('id').split('.');
    var tag_ids = {
        swn_i: ids[0] + '.NOR.IND',
        swr_i: ids[0] + '.REV.IND',
        swn_c: ids[0] + '.NOR.CTL',
        swr_c: ids[0] + '.REV.CTL',
        tk_i: ids[1] + '.IND',
        swl_i: ids[0] + '.LK.IND',
        other_sw_i: ids[2] + '.NOR.IND'
    };
    
    //Get the elements
    var elems = {
        swn_point: elem.getElementsByClassName('swn-point')[0],
        swr_point: elem.getElementsByClassName('swr-point')[0],
        swn_tk: elem.getElementsByClassName('swn-tk')[0],
        swr_tk: elem.getElementsByClassName('swr-tk')[0],
        sw_lock: elem.getElementsByClassName('sw-lock')[0],
        trail_tk: elem.getElementsByClassName('trail-tk')[0],
        clickarea: elem.getElementsByClassName('click')[0]
    };
    
    //Add controls popup
    vyhmi.create_ctl_popup(
        elem, { 'SWITCH NORMAL': function() { console.log('normal');vyhmi.app_call('pulse_tag', 
                                                { tagid:tag_ids.swn_c, values:[1,0], duration:2000});
                                            },
               'SWITCH REVERSE': function() { vyhmi.app_call('pulse_tag', 
                                                { tagid:tag_ids.swr_c, values:[1,0], duration:2000});
                                            }
              });
    
    //Function to draw switch
    function draw (){
        
        //console.log('draw inds:',inds);
        
        elems.sw_lock.style.fill = (inds.sw_lk_i==0)?lcp_colors.TM_LOK_OFF:lcp_colors.TM_LOK_ON;
        
        elems.swn_point.style.visibility=(inds.swn_i == 0)?'hidden':'visible';
        elems.swr_point.style.visibility=(inds.swr_i == 0)?'hidden':'visible';
       
        //If trail switch is not normal then all track colors will be unocc color, else based on tk_i
        //Switch point color is based on track ccupancy
        elems.swn_point.style.stroke =  ( (inds.trail_swn_i==1) && (inds.tk_i==1) )?lcp_colors.TK_OCC_ON:lcp_colors.TK_OCC_OFF;
        elems.swr_point.style.stroke =  ( (inds.trail_swn_i==1) && (inds.tk_i==1) )?lcp_colors.TK_OCC_ON:lcp_colors.TK_OCC_OFF;
        
        //Trail track occ color only if trail swn
        elems.trail_tk.style.stroke =  ( (inds.trail_swn_i==1) && (inds.tk_i==1) )?lcp_colors.TK_OCC_ON:lcp_colors.TK_OCC_OFF;

        //swn track occ color only if swn
        elems.swn_tk.style.stroke =  ( (inds.trail_swn_i==1) && (inds.swn_i==1) && (inds.tk_i==1) )?lcp_colors.TK_OCC_ON:lcp_colors.TK_OCC_OFF;

        //swr track occ color only if swr
        elems.swr_tk.style.stroke =  ( (inds.swr_i==1) && (inds.tk_i==1) )?lcp_colors.TK_OCC_ON:lcp_colors.TK_OCC_OFF;               
    }
           
    vyhmi.create_tagsub(tag_ids.swn_i, function(tag) {
        inds.swn_i = tag.value;
        draw();
    });
    vyhmi.create_tagsub(tag_ids.swr_i, function(tag) {
        inds.swr_i = tag.value;
        draw();
    });
    vyhmi.create_tagsub(tag_ids.tk_i, function(tag) {
        inds.tk_i = tag.value;
        draw();
    });
    vyhmi.create_tagsub(tag_ids.other_sw_i, function(tag) {
        inds.trail_swn_i = tag.value;
        draw();
    });    
    vyhmi.create_tagsub(tag_ids.swl_i, function(tag) {
        inds.sw_lk_i = tag.value;
        draw();
    });      

}

/*
*/
function instr_traffic(elem){
    
    var north_arrows = elem.getElementsByClassName('tf-north');
    var south_arrows = elem.getElementsByClassName('tf-south');
    
    //Subscribe to tags
    vyhmi.create_tagsub(elem.id + '.NORTH.IND', function(tag) {
        for(var i=0; i<north_arrows.length; i++){
            north_arrows[i].style.stroke = tag.value==0 ? lcp_colors.TF_DIR_OFF:lcp_colors.TF_DIR_ON;
        }
    });
    
    vyhmi.create_tagsub(elem.id + '.SOUTH.IND', function(tag) {
        for(var i=0; i<south_arrows.length; i++){
            south_arrows[i].style.stroke = tag.value==0 ? lcp_colors.TF_DIR_OFF:lcp_colors.TF_DIR_ON;
        }
    });
    
}

var vyns = 'www.vytronics.com/hmi';

/*============ SIGNAL STUFF ======================

Tag naming convention
---------------------
Signal Name - SGXX
    SGXX.CLEAR.IND
    SGXX.CLEAR.CTL
    SGXX.STOP.CTL
    SGXX.CALLON.CTL
    SGXX.TL.IND
*/        
//Instrument a signal graphic element given a signal name
//that is stored in symbol group id attribute
//  group id=SG3S
//  signal ball part: class="sig-ball"
//  time lock part:     class="time-lock"
//
function instr_signal(elem) {
    
    console.log('instr_signal elem:',elem);
    
    var signame = elem.getAttribute('id');
    var sigball = elem.getElementsByClassName('sig-ball')[0];
    var timelk = elem.getElementsByClassName('sig-time-lock')[0];
    
    var ids = {
        sgclear_i: signame + '.CLEAR.IND',
        sgclear_c: signame + '.CLEAR.CTL',
        sgstop_c: signame + '.STOP.CTL',
        sgcallon_c: signame + '.CALLON.CTL',
        sgtl_i: signame + '.TL.IND'
    };

    //console.log('sig:',sigball,' tl:',timelk);
    
    //Signal ball animation
    vyhmi.poke_style(sigball,ids.sgclear_i,'fill',[lcp_colors.SG_STOP,lcp_colors.SG_CLEAR]);

    //Time lock anmiation
    if ( timelk) { //Not every signal may have this
        vyhmi.poke_style(timelk, ids.sgtl_i, 'visibility',['hidden','visible']);
    }
    
   //Add controls popup
    vyhmi.create_ctl_popup(
        elem, { 'SIGNAL CLEAR': function() { vyhmi.app_call('pulse_tag', 
                                                { tagid:ids.sgclear_c, values:[1,0], duration:2000});
                                            },
               'SIGNAL STOP': function() { vyhmi.app_call('pulse_tag', 
                                                { tagid:ids.sgstop_c, values:[1,0], duration:2000});
                                            },
               'CALL ON': function() { vyhmi.app_call('pulse_tag', 
                                                { tagid:ids.sgcallon_c, values:[1,0], duration:2000});
                                            }
               
              });    
}

//Instrument the holdout signal. Only one of them (5N)
function instr_holdout_signal(elem) {
    console.log('instr_signal elem:',elem);
    
    var signame = elem.getAttribute('id');
    var sigball = elem.getElementsByClassName('sig-ball')[0];
    var inhibit = elem.getElementsByClassName('sig-inhibit')[0];
    
    var ids = {
        sgclear_i: signame + '.CLEAR.IND',
        sginh_i: signame + '.INH.IND',
        sginh_set_c: signame + '.INH.SET.CTL',
        sginh_reset_c: signame + '.INH.RESET.CTL'
    };

    //console.log('sig:',sigball,' tl:',timelk);
    
    //Signal ball animation
    vyhmi.poke_style(sigball,ids.sgclear_i,'fill',[lcp_colors.SG_STOP, lcp_colors.SG_CLEAR]);

    //Inhibit text animation
    vyhmi.poke_style(inhibit, ids.sginh_i, 'fill',[lcp_colors.INHIBIT_OFF, lcp_colors.INHIBIT_ON]);
    
   //Add controls popup
    vyhmi.create_ctl_popup(
        elem, { 'INHIBIT': function() { vyhmi.app_call('pulse_tag', 
                                                { tagid:ids.sginh_set_c, values:[1,0], duration:2000});
                                            },
               'ENABLE': function() { vyhmi.app_call('pulse_tag', 
                                                { tagid:ids.sginh_reset_c, values:[1,0], duration:2000});
                                            }
              });    
}    
        
instrument_lcp();
