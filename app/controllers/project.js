var mongoose = require('mongoose'),
    Project = mongoose.model('Project'),
    Company = mongoose.model('Company'),
    Attendance = mongoose.model('Attendance'),
    Moment = require('moment-timezone'),
    empFn = require('../../functions/employeefn.js'),
    async = require('async');


function checkProjectJC(companyId, JC, callback) {
    var workCode = JC;
    Project.find({
        'companyId': companyId
    }, function(err, projectDetail) {

        var tcFound = false,
            jcFound = false,
            taskArray = [],
            taskArrayNew = [];

        if (projectDetail.length > 0) {
            projectDetail.forEach(function(wc, index1) {
                if (wc.JC === workCode) {
                    jcFound = true;
                    console.log("JCFOUND " + workCode);
                } else if (wc.tasks.length > 0) {
                    wc.tasks.forEach(function(tc, index2) {
                        if (tc.taskCode === workCode) {
                            tcFound = true;
                            console.log("TCFOUND " + workCode);
                        }
                    });
                }
                if ((index1 + 1) === projectDetail.length) {
                    if (jcFound) {
                        callback(false);
                    } else if (tcFound) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                }
            });
        } else {
            callback(true);
        }
    });
};

exports.getProjectDetailEmpWise = function(req, res) {
    console.log(req.params.employeeNo);
    var companyId = req.session.user;
    // console.log(companyId);
    Project.find({
        'companyId': req.session.user,
        'users.employeeNo': req.params.employeeNo
    }, function(err, detail) {
        // console.log(detail);
        res.json({
            projectData: detail
        })
    });
}

exports.deleteProjectById = function(req, res) {
    Project.remove({
        '_id': req.body.projectId
    }, function(err, detail) {
        res.json(true);
    });
}



exports.createproject = function(req, res) {
    var companyId = req.session.user;
    var projectname = req.body.projectname;
    var clientname = req.body.clientname;
    var JC = req.body.JC;
    var budgetH = req.body.budgetH;
    var budget$ = req.body.budget$;
    var supervisorH = req.body.supervisorH;
    var supervisor$ = req.body.supervisor$;
    var alerts = req.body.alerts;
    var tasks = req.body.tasks;
    var nonbillable = req.body.nonbillable;

    checkProjectJC(req.session.user, JC, function(status) {
        if (status) {
            Company.findById(companyId, function(err, companyData) {
                if (companyData) {
                    var companyname = companyData.companyname;
                    var project = new Project()
                    project.companyname = companyname,
                        project.companyId = companyId,
                        project.projectname = projectname,
                        project.clientname = clientname,
                        project.JC = JC,
                        project.budgetH = budgetH,
                        project.budget$ = budget$,
                        project.supervisorH = supervisorH,
                        project.supervisor$ = supervisor$,
                        project.alerts = alerts,
                        project.active = true,
                        project.save(function(err, data) {
                            if (err)
                                throw err;
                            var projectId = data._id;
                            if (tasks.length > 0) {
                                for (i = 0; i < tasks.length; i++) {
                                    var splitArray = tasks[i].split(",");
                                    var taskString = splitArray[0];
                                    var taskSplit = taskString.split(":");
                                    var taskName = taskSplit[0];
                                    var taskcode = taskSplit[1];
                                    taskcode = JC + taskcode;
                                    var nonbillable = taskSplit[2];
                                    Project.update({
                                        '_id': projectId
                                    }, {
                                        $set: {
                                            calFlag: false,
                                        }
                                    }, {
                                        $push: {
                                            tasks: {
                                                taskname: taskName,
                                                taskCode: taskcode,
                                                nonbillable: nonbillable
                                            }
                                        }
                                    }, {
                                        upsert: true,
                                        new: false
                                    }, function(err, data) {
                                        if (err) {
                                            res.json({
                                                'data': false
                                            });
                                        } else {
                                            res.json({
                                                'data': status
                                            });
                                        }
                                    });
                                }
                            } else {
                                res.json({
                                    'data': status
                                });
                            }
                        });
                }
            });
        } else {
            res.json({
                'data': status
            });
        }
    });
}

exports.projectSearch = function(req, res) {
    var searchText = req.body.searchtext;
    if (isNaN(searchText) == true) {
        var intTxt = "";
    } else {
        var intTxt = Number(searchText);
    }
    if (intTxt != '') {
        Project
            .find({
                'companyId': req.session.user,
                $or: [{
                    'projectname': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }, {
                    'clientname': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }, {
                    'tasks.taskname': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }, {
                    'tasks.taskCode': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }, {
                    'companyname': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }, {
                    'email': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }]
            })
            .sort({
                '_id': 'asc'
            })
            .exec(function(err, projectData) {
                if (projectData) {
                    res.json(projectData);
                } else {
                    console.log(err);
                }
            })
    } else {
        Project
            .find({
                'companyId': req.session.user,
                $or: [{
                    'projectname': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }, {
                    'clientname': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }, {
                    'tasks.taskname': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }, {
                    'tasks.taskCode': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }, {
                    'companyname': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }, {
                    'email': {
                        $regex: searchText,
                        $options: 'i'
                    }
                }]
            })
            .sort({
                '_id': 'asc'
            })
            .exec(function(err, projectData) {
                if (projectData) {
                    res.json(projectData);
                } else {
                    console.log(err);
                }
            })
    }
}

exports.getprojects = function(req, res) {
    Project.find({
        'active': true,
        'companyId': req.session.user
    }).sort({
        '_id': 'asc'
    }).exec(function(err, data) {
        // console.log(data);
        if (data) {
            res.json(data);
        }
    })
}
exports.getProjectsList = function(req, res) {
    Project.find({
        'companyId': req.session.user
    }).sort({
        '_id': 'asc'
    }).exec(function(err, data) {
        if (data) {
            res.json(data);
        }
    })
}
exports.archievedProjectEditData = function(req, res) {
    Project.find({
        active: false,
        '_id': req.params.projectId
    }).sort({
        '_id': 'asc'
    }).exec(function(err, data) {
        if (data) {
            res.json(data);
        }
    })
}
exports.getProjectDetail = function(req, res) {
    Project.find({}).sort({
        '_id': 'asc'
    }).exec(function(err, data) {
        if (data) {
            res.json(data);
        }
    })
}
exports.getArchivePojects = function(req, res) {
    Project.find({
        active: false,
        'companyId': req.session.user
    }).sort({
        '_id': 'asc'
    }).exec(function(err, data) {
        if (data) {
            res.json(data);
        }
    })
}


exports.editproject = function(req, res) {
    Project.findOne({
        '_id': req.params.projectId,
        'companyId': req.session.user
    }).sort({
        '_id': 'asc'
    }).exec(function(err, data) {
        if (data) {
            res.json(data);
        }
    })
}

/* check in db for task change*/
function checkDBTask(projectTasks, newTasks, callback) {
    var updatedTaskList = projectTasks;
    newUpdatedTaskList = []; //For update 
    if (newTasks.length > 0) {
        newTasks.forEach(function(tsk, index) {
            var a = projectTasks.map(function(e) {
                console.log("project code " + e.taskCode);
                return e.taskCode;
            }).indexOf(tsk.taskCode);
            if (a == -1) {
                console.log("pushed...");
                // console.log(tsk);
                updatedTaskList.push({
                    taskname: tsk.taskname,
                    taskCode: tsk.taskCode,
                    nonbillable: tsk.nonbillable,
                });
            } else {
                console.log('updated...');
                // console.log(tsk);
                newUpdatedTaskList.push({
                    taskname: tsk.taskname,
                    taskCode: tsk.taskCode,
                    nonbillable: tsk.nonbillable,
                });
            }
            if ((index + 1) == newTasks.length) {
                console.log("----> task list <-----")
                if (newTasks.length === 0) {
                    callback('empty');
                } else {
                    console.log(newUpdatedTaskList);
                    updatedTaskList.forEach(function(ut, inu) {
                        newUpdatedTaskList.forEach(function(nut) {
                            if (nut.taskCode === ut.taskCode) {
                                ut.taskname = nut.taskname;
                                ut.nonbillable = nut.nonbillable;
                            }
                        });
                        if (updatedTaskList.length === inu + 1)
                            callback(updatedTaskList);
                    });
                    // console.log(updatedTaskList);     
                }
            }
        });
    } else {
        callback(newUpdatedTaskList);
    }
};

/* Project Update */
exports.updateproject = function(req, res) {
    var companyId = req.session.user;
    var projectId = req.body._id;
    var projectname = req.body.projectname;
    var clientname = req.body.clientname;
    var JC = req.body.JC;
    var budgetH = req.body.budgetH;
    var budget$ = req.body.budget$;
    var supervisorH = req.body.supervisorH;
    var supervisor$ = req.body.supervisor$;
    var alerts = req.body.alerts;
    var tasks = req.body.tasks;
    var updatedTasks = [];

    /* Set the updated task list  */
    tasks.forEach(function(t) {
        var splitArray = t.split(",");
        var taskString = splitArray[0];
        var taskSplit = taskString.split(":");
        var taskName = taskSplit[0];
        var taskcode = taskSplit[1];
        taskcode = JC + taskcode;
        var nonbillable = taskSplit[2];

        updatedTasks.push({
            taskname: taskName,
            taskCode: taskcode,
            nonbillable: nonbillable
        });
    });

    Project.find({
        '_id': projectId
    }, function(errsP, projectDetail) {
        // console.log(projectDetail[0].tasks);
        checkDBTask(projectDetail[0].tasks, updatedTasks, function(taskList) {
            console.log(taskList);
            Project.update({
                '_id': projectId
            }, {
                $set: {
                    projectname: projectname,
                    clientname: clientname,
                    JC: JC,
                    budgetH: budgetH,
                    budget$: budget$,
                    supervisorH: supervisorH,
                    supervisor$: supervisor$,
                    alerts: alerts,
                    tasks: taskList,
                    active: req.body.active,
                }
            }, {
                upsert: false,
                new: false
            }, function(err, data) {
                if (err) {
                    console.log(err);
                    res.json(false);
                } else {
                    res.json(true);
                }
            }); //Update
        }); //Check
    }); //ProjectDetails
};

exports.countTasktotals = function(req, res) {
    Project.find({}).sort({
        '_id': 'asc'
    }).exec(function(err, dataProject) {
        if (dataProject.length > 0) {
            dataProject.forEach(function(projectData) {
                var companyId = projectData.companyId;
                console.log(companyId + 'companyId');
                var projectId = projectData._id;
                var tasks = projectData.tasks;
                tasks.forEach(function(task) {
                    var taskId = task._id;
                    var taskCode = task.taskCode;
                    Project.aggregate({
                        $match: {
                            "users.workCode": taskCode,
                            'companyId': companyId
                        }
                    }, {
                        $unwind: "$users"
                    }, {
                        $match: {
                            "users.workCode": taskCode
                        }
                    }).exec(function(err, dataProject) {
                        if (dataProject.length > 0) {
                            var n = 0;
                            var taskTotal = 0;
                        } else {
                            console.log(err);
                        }
                    });
                });
            });
        }
    });
}