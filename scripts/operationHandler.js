loadMask(1, "loading modules");

let Admin = require('././scripts/adminManager');
let TaskM = require('././scripts/taskManager');
let Ove_ViewLdr = require('././scripts/Overview_ViewLoader');
let AllTask_ViewLdr = require('././scripts/AllTask_ViewLoader');
let TaskVerification_ViewLdr = require('././scripts/TaskVerification_ViewLoader');
let res = require('././shared/resources');

loadMask(1, "initializing");

const admin = new Admin();
const taskm = new TaskM();
const ovl = new Ove_ViewLdr();
const atvl = new AllTask_ViewLdr();
const tskv = new TaskVerification_ViewLdr();

loadMask(0);

async function operationTrigger(...args) 
{
    if (args.length == 1) 
    {
        operationSwitch(args[0]);
    }
    else 
    {
        operationSwitch(args[0], args[1]);
    }
}

async function operationSwitch(params, values) {
    switch (params) 
    {
        //---------------------------------------------------------------------
        // OVERVIEW OPERATIONS
        //---------------------------------------------------------------------
        case "base_getAllOverviewData":
            {
                loadMask(1, "fetching data");
                //let data = await taskm.getAllTaskData();
                let data = await taskm.getAllTaskData();
                let summaryData = await taskm.getTaskSummaryData();
                let element = document.getElementById("task-panel");
                let element_list = document.getElementById("task-list");
                let moduleTable = document.getElementById("module-frag-table").getElementsByTagName('tbody')[0];
                let summarySec = document.getElementById("summary-section");
                let perfChart = document.getElementById("performance-chart");
                let modOccupChart = document.getElementById("mod-occup-chart");
                loadMask(1, "populating ui view");
                ovl.parseTaskSectionObject(data, element, element_list);
                ovl.parseSummarySectionObject(summaryData, summarySec, moduleTable, perfChart, modOccupChart);
                loadMask(0);
                break;
            }

        case "base_getAllTaskData":
            {
                loadMask(1, "fetching data");
                let all_data = await taskm.getAllTaskData();
                all_data = all_data["rows"];
                let allTaskNewTile = document.getElementById("all-tsk-summ-new")
                let allTaskCompleteTile = document.getElementById("all-tsk-summ-cmpl")
                let allTaskTotalTile = document.getElementById("all-tsk-summ-tot")
                let allTaskSelfCompleteTile = document.getElementById("all-tsk-slf-cmpl")
                let allTaskSelfDeleteTile = document.getElementById("all-tsk-slf-del")
                loadMask(1, "populating ui view");
                atvl.parseSummaryTaskData(all_data, allTaskNewTile, allTaskCompleteTile, allTaskTotalTile, allTaskSelfCompleteTile, allTaskSelfDeleteTile);
                atvl.loadDataOnTaskTable(all_data);
                loadMask(0);
                break;
            }
        
        case "base_getAllVerificationData":
            {
                loadMask(1 , "fetching verification data");
                let data = await taskm.getTaskVerificationCommitData();
                let data2 = await taskm.getTaskVerificationDeleteData();
                loadMask(1 , "populating ui view");
                await tskv.loadSelfCommitsVerificationData(data);
                await tskv.loadSelfDeletesVerificationData(data2);
                loadMask(0);
                break;
            }
        
        case "base_getAllAssignmentData" :
            {
                loadMask(1 , "fetching assignment data");
                let summaryData = await taskm.getTaskVerificationAssignmentSummary();
                let rscData = await taskm.getTaskVerificationRSCUtilzationData();
                let assignmentData = await taskm.getTaskVerificationAssignementData();
                console.log(summaryData);
                console.log(rscData);
                console.log(assignmentData);
                loadMask(1 , "populating ui view");
                tskv.loadAssignmentSummaryData(summaryData);
                tskv.loadResourceUtilizationData(rscData);
                tskv.loaTaskdAssignmentData(assignmentData);
                loadMask(0);
                break;
            }

        //---------------------------------------------------------------------
        // ADMIN OPERATIONS
        //---------------------------------------------------------------------
        case "admin_createProject":
            {
                loadMask(1, 'creatig new project');
                admin.createProject(params);
                loadMask(0);
                break;
            }

        case "admin_createUser":
            {
                loadMask(1, 'creatig new user');
                await admin.createUser(params);
                let email = document.getElementById('adm-Usr-Email').value;
                let projectId = document.getElementById('adm-Usr-Project').value;
                let userId = await admin.getUserId(email);
                admin.createUserAssignerMap(userId, res["STR_USERID"]);
                admin.createUserProjectMap(userId, projectId)
                loadMask(0);
                break;
            }

        case "admin_transferUser":
            {
                loadMask(1, 'updating user mappings');
                let userToTransfer = document.getElementById('adm-UsrAsi-Source').value;
                let targetUser = document.getElementById('adm-UsrAsi-Target').value;
                admin.updateUserAssignerMap(userToTransfer, targetUser);
                let projectId = await admin.getProjectIdFromUser(targetUser);
                admin.updateUserProjectMap(userToTransfer, projectId);
                loadMask(0);
                break;
            }

        case "admin_createTask":
            {
                loadMask(1, 'creatig new task');
                await admin.createTask(params);
                loadMask(0);
                break;
            }

        case "admin_createAsset":
            {
                loadMask(1, 'creating new Asset');
                let projectId = document.getElementById("adm-Ast-Project").value;
                let category = document.getElementById("adm-Ast-Category").value;
                let categoryName = document.getElementById("adm-Ast-CatName").value;
                switch (category) {
                    case "Module":
                        console.log("IN MODULE SWITCH")
                        await admin.createModule(categoryName);
                        let moduleId = await admin.getModuleId(categoryName);
                        admin.createModuleProjectMap(moduleId, projectId);
                        break;
                    case "Type":
                        await admin.createType(categoryName);
                        let typeId = await admin.getTypeId(categoryName);
                        admin.createTypeProjectMap(typeId, projectId);
                        break;
                    case "Priority":
                        await admin.createPriority(categoryName);
                        let priorityId = await admin.getPriorityId(categoryName);
                        admin.createPriorityProjectMap(priorityId, projectId);
                        break;
                }
                loadMask(0);
                break;
            }

        //---------------------------------------------------------------------
        // TASKBOARD OPERATIONS
        //---------------------------------------------------------------------    
        
        case "tsb_NextTaskWorkflowState":
            {
                loadMask(1, "performing operation");
                await taskm.updateNextTaskWorkflowState(res["TASKDATA_TABLE"]);
                loadMask(0);
                break;
            }
        
        case "tsb_TaskToSelfCommitState":
            {
                loadMask(1, "performing self commit operation");
                await taskm.updateTaskWorkflowStateToSelfCommit(res["TASKDATA_TABLE"]);
                loadMask(0);
                break;
            }

        case "tsb_TaskToSelfDeleteState":
            {
                loadMask(1, "performing self delete operation");
                await taskm.updateTaskWorkflowStateToSelfDelete(res["TASKDATA_TABLE"]);
                loadMask(0);
                break;
            }

        //---------------------------------------------------------------------
        // TASK VERIFICATION OPERATIONS
        //---------------------------------------------------------------------    
        
        case "tskv_MarkTaskAsComplete":
            {
                loadMask(1, "updating task status");
                await taskm.TSKV_updateTaskToComplete(values);
                loadMask(0);
                break;
            }
        case "tskv_MarkTaskAsDelete":
            {
                loadMask(1, "updating task status");
                await taskm.TSKV_updateTaskToDelete(values);
                loadMask(0);
                break;
            }
        case "tskv_MarkTaskAsRevert":
            {
                loadMask(1, "updating task status");
                await taskm.TSKV_revertTask(values);
                loadMask(0);
                break;
            }
        case "tskv_MarkMultiTaskAsComplete":
            {
                loadMask(1, "updating multiple task status");
                await taskm.TSKV_updateTaskToComplete_Multi(res["TASKVERIFICATION_SLFCOMMIT_TABLE"])
                loadMask(0);
                break;
            }
        case "tskv_MarkMultiTaskAsDelete":
            {
                loadMask(1, "updating multiple task status");
                await taskm.TSKV_updateTaskToDelete_Multi(res["TASKVERIFICATION_SLFDELETE_TABLE"])
                loadMask(0);
                break;
            }
        case "tskv_MarkMultiTaskAsRevert":
            {
                let tablename = "";
                if(values == "SelfCommitTable")
                {
                    tablename = res["TASKVERIFICATION_SLFCOMMIT_TABLE"]
                }
                if(values == "SelfDeleteTable")
                {
                    tablename = res["TASKVERIFICATION_SLFDELETE_TABLE"]
                }
                await taskm.TSKV_revertTask_Multi(tablename);
                break;
            }

        default:
            break;

    }
}