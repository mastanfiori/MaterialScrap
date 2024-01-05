sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,  formatter, Filter, FilterOperator, MessageToast, Fragment, MessageBox, JSONModel) {
        "use strict";
        var oView, Plant, ProductionOrder, i18n;
        return Controller.extend("com.nttdata.subzero.ncfmaterialscrap.controller.InitialView", {
            formatter: formatter,

            onInit: function () {
                var sURL, oModel;
                 //Fetch i18n Model
                i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                oModel = this.getOwnerComponent().getModel();
                oView = this.getView();
                oView.setModel(oModel);

                var obj = {Plant:"",ProductionOrder:"",WorkCenter:"",Material:"",Quantity:"",UoM:"",Batch:"",DefectCode:"",Comments:""};
                var postModel = new JSONModel(obj);
                oView.setModel(postModel, "PostModel");

                this._getDefaults(); //Load User Plant

                // sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = fBackButton;

            },

            /**
         * get Default value 'Plant' from User Parameters and set it all the models.
         */
            _getDefaults: function () {
                var that = this;
                var model = this.getOwnerComponent().getModel();
                model.read("/UserDetailsSet", {
                    method: "GET",
                    success: function (response) {
                        if (response.Plant !== "") { //Loading Set Valuehelp based on User Plant.
                            Plant = response.Plant;
                            oView.getModel("PostModel").getData().Plant = response.results[0].Plant;
                            oView.getModel("PostModel").getData().PlantName = response.results[0].PlantName;
                            oView.getModel("PostModel").refresh();
                        } else {
                            MessageBox.error(i18n.getText("MandatoryPlant"));
                            return;
                        }
                    },
                    error: function (oError) {
                    }
                });

            },



            onMatVH: function (oEvt) {
                if (!this._mValueHelpDialog) {

                    // Add plant filter
                    if (oView.getModel("PostModel").getProperty("/Plant")) {
                        var oFilter = new sap.ui.model.Filter(
                            "Plant",
                            sap.ui.model.FilterOperator.EQ,
                            oView.getModel("PostModel").getProperty("/Plant")
                        );
                    }
                    this._mValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.nttdata.subzero.ncfmaterialscrap.fragments.MatValuehelp",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        oValueHelpDialog.getBinding("items").filter([oFilter]);
                        return oValueHelpDialog;
                    });
                }
                this._mValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open();
                }.bind(this));
            },

            /**
             * Search method for SetName Valuehelp
             * User can search using Set Description
             * @param {*} oEvent 
             */
            onValueHelpMatSearch: function (oEvt) {
                var sQuery = oEvt.getParameter("value");
                if (sQuery && sQuery.length > 0) {
                    var aFilters = new Filter([
                        new Filter("Material", FilterOperator.Contains, sQuery),
                        new Filter("MaterialName", FilterOperator.Contains, sQuery)
                    ])
                }
                var oBinding = oEvt.getParameter("itemsBinding");
                oBinding.filter(aFilters);
            },

            /**
             * Triggered when user selects one of the SetName from the Valuehelp.
             * @param {*} oEvent 
             */
            onValueHelpMatConfirm: function (oEvent) {
                var value = oEvent.getParameters().selectedItem.getBindingContext().getObject().Material;
                var uom = oEvent.getParameters().selectedItem.getBindingContext().getObject().MaterialBaseUnit;
                var matDesc = oEvent.getParameters().selectedItem.getBindingContext().getObject().MaterialName;
                oView.getModel("PostModel").getData().Material = value;
                oView.getModel("PostModel").getData().MaterialName = matDesc;
                oView.getModel("PostModel").getData().UoM = uom;
                oView.getModel("PostModel").refresh();
            },

            onWCVH: function (oEvt) {
                // Add Production Order filter
                if (oView.getModel("PostModel").getProperty("/ProductionOrder")) {
                    var oFilter = new sap.ui.model.Filter(
                        "ManufacturingOrder",
                        sap.ui.model.FilterOperator.EQ,
                        oView.getModel("PostModel").getProperty("/ProductionOrder")
                    );
                }else{
                    MessageToast.show(i18n.getText("PleaseEnterProdOrderFirst"));
                    return;
                }
                if (!this._wcValueHelpDialog) {
                    this._wcValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.nttdata.subzero.ncfmaterialscrap.fragments.WCValueHelp",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        oValueHelpDialog.getBinding("items").filter([oFilter]);
                        return oValueHelpDialog;
                    });
                }
                this._wcValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.getBinding("items").filter([oFilter]);
                    oValueHelpDialog.open();
                }.bind(this));
            },

            /**
             * Search method for SetName Valuehelp
             * User can search using Set Description
             * @param {*} oEvent 
             */
            onValueHelpWCSearch: function (oEvt) {
                var sQuery = oEvt.getParameter("value");
                if (sQuery && sQuery.length > 0) {
                    var aFilters = new Filter([
                        new Filter("WorkCenter", FilterOperator.Contains, sQuery),
                        new Filter("WorkCenterText", FilterOperator.Contains, sQuery)
                    ])
                }
                var oBinding = oEvt.getParameter("itemsBinding");
                oBinding.filter(aFilters);
            },

            /**
             * Triggered when user selects one of the SetName from the Valuehelp.
             * @param {*} oEvent 
             */
            onValueHelpWCConfirm: function (oEvent) {
                var value = oEvent.getParameters().selectedItem.getBindingContext().getObject().WorkCenter;
                var valueText = oEvent.getParameters().selectedItem.getBindingContext().getObject().WorkCenterText;

                // var uom = oEvent.getParameters().selectedItem.getBindingContext().getObject().MaterialBaseUnit;
                oView.getModel("PostModel").getData().WorkCenter = value;
                oView.getModel("PostModel").getData().WorkCenterText = valueText;
                // oView.getModel("PostModel").getData().Uom = uom;
                oView.getModel("PostModel").refresh();
            },


            onSLocVH: function (oEvt) {
                if (!this._sLocValueHelpDialog) {
                    this._sLocValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.nttdata.subzero.ncfmaterialscrap.fragments.SLocValuehelp",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }
                this._sLocValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open();
                }.bind(this));
            },

            /**
             * Search method for SetName Valuehelp
             * User can search using Set Description
             * @param {*} oEvent 
             */
            onValueHelpSLocSearch: function (oEvt) {
                var sQuery = oEvt.getParameter("value");
                if (sQuery && sQuery.length > 0) {
                    var aFilters = new Filter([
                        new Filter("StorageLocation", FilterOperator.Contains, sQuery),
                        new Filter("StorageLocationName", FilterOperator.Contains, sQuery)
                    ])
                }
                var oBinding = oEvt.getParameter("itemsBinding");
                oBinding.filter(aFilters);
            },

            /**
             * Triggered when user selects one of the SetName from the Valuehelp.
             * @param {*} oEvent 
             */
            onValueHelpSLocConfirm: function (oEvent) {
                var value = oEvent.getParameters().selectedItem.getBindingContext().getObject().StorageLocation;
                // var uom = oEvent.getParameters().selectedItem.getBindingContext().getObject().MaterialBaseUnit;
                oView.getModel("PostModel").getData().StorageLocation = value;
                // oView.getModel("PostModel").getData().Uom = uom;
                oView.getModel("PostModel").refresh();
            },

            /**
             * on Value help click for Operator
             * @param {*} oEvent Input F4 click
             */
            onOperatorVH: function (oEvent) {
                if (!this._opratorValueHelpDialog) {
                    this._opratorValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.nttdata.subzero.ncfmaterialscrap.fragments.OperatorVH",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }
                this._opratorValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open();
                }.bind(this));
            },
            /**
             * Search method for Operator Valuehelp
             * User can search using Set Description
             * @param {*} oEvent 
             */
            onOperatorSearch: function (oEvt) {
                var sQuery = oEvt.getParameter("value");
                if (sQuery && sQuery.length > 0) {
                    var aFilters = new Filter([
                        new Filter("pernr", FilterOperator.Contains, sQuery),
                        new Filter("ename", FilterOperator.Contains, sQuery)
                    ])
                }
                var oBinding = oEvt.getParameter("itemsBinding");
                oBinding.filter(aFilters);
            },

            /**
             * Triggered when user selects one of the Operator from the Valuehelp.
             * @param {*} oEvent 
             */
            onOperatorF4Confirm: function (oEvent) {
                var value = oEvent.getParameters().selectedItem.getBindingContext().getObject().pernr;
                var valueText = oEvent.getParameters().selectedItem.getBindingContext().getObject().ename;
                oView.getModel("PostModel").setProperty("/Operator", value)
                oView.getModel("PostModel").setProperty("/OperatorName", valueText);
                oView.getModel("PostModel").refresh();
            },
            onPOVH: function (oEvt) {
                if (!this._poValueHelpDialog) {
                    this._poValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.nttdata.subzero.ncfmaterialscrap.fragments.ProdOrderValuehelp",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }
                this._poValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open();
                }.bind(this));
            },

            /**
             * Search method for SetName Valuehelp
             * User can search using Set Description
             * @param {*} oEvent 
             */
            onValueHelpPOSearch: function (oEvt) {
                var sQuery = oEvt.getParameter("value");
                if (sQuery && sQuery.length > 0) {
                    var aFilters = new Filter([
                        new Filter("ManufacturingOrder", FilterOperator.Contains, sQuery),
                        new Filter("ManufacturingOrderText", FilterOperator.Contains, sQuery)
                    ])
                }
                var oBinding = oEvt.getParameter("itemsBinding");
                oBinding.filter(aFilters);
            },

            /**
             * Triggered when user selects one of the SetName from the Valuehelp.
             * @param {*} oEvent 
             */
            onValueHelpPOConfirm: function (oEvent) {
                var value = oEvent.getParameters().selectedItem.getBindingContext().getObject().ManufacturingOrder;
                var valueText = oEvent.getParameters().selectedItem.getBindingContext().getObject().ManufacturingOrderText;
                // debugger;
                // var uom = oEvent.getParameters().selectedItem.getBindingContext().getObject().MaterialBaseUnit;
                oView.getModel("PostModel").getData().ProductionOrder = value;
                oView.getModel("PostModel").getData().ProductionOrderText = valueText;
                oView.getModel("PostModel").setProperty("/WorkCenter", "");
                oView.getModel("PostModel").setProperty("/WorkCenterText", "");  
                oView.getModel("PostModel").refresh();
                this.onProdConfirm();
            },

            //mastan
            onProdConfirm: function(){
                // debugger;
                var Product = oView.getModel("PostModel").getData().ProductionOrder;
                if (Product !== "") {
                    var sFilters = [];
                    sFilters.push(new sap.ui.model.Filter("ManufacturingOrder", sap.ui.model.FilterOperator.EQ, Product));
                    
                }else{
                    MessageToast.show(i18n.getText("PleaseEnterProdOrderFirst"));
                    return;
                }

                var sPath = "/ZP_V_PP_PO_WRKCNTR";
                var oSuccess = function (oData) {
                    // debugger;
                    sap.ui.core.BusyIndicator.hide();
                    if(oData.results.length === 1){
                        oView.getModel("PostModel").setProperty("/WorkCenter", oData.results[0].WorkCenter);
                        oView.getModel("PostModel").setProperty("/WorkCenterText", oData.results[0].WorkCenterText);
                        oView.getModel("PostModel").refresh(); 
                    }
                    else{
                        oView.getModel("PostModel").setProperty("/WorkCenter", "");
                        oView.getModel("PostModel").setProperty("/WorkCenterText", "");  
                        oView.getModel("PostModel").refresh();
                    }
                    
                }.bind(this);
                var oError = function (error) {
                    sap.ui.core.BusyIndicator.hide();
                }.bind(this);
              
                this.getOwnerComponent().getModel().read(sPath, {
                    success: oSuccess,
                    error: oError,
                    filters: sFilters

                });


            },
           

            onCCVH: function (oEvt) {
                if (!this._ccValueHelpDialog) {
                    this._ccValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.nttdata.subzero.ncfmaterialscrap.fragments.CCValuehelp",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }
                this._ccValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open();
                }.bind(this));
            },

            /**
             * Search method for SetName Valuehelp
             * User can search using Set Description
             * @param {*} oEvent 
             */
            onValueHelpCCSearch: function (oEvt) {
                var sQuery = oEvt.getParameter("value");
                if (sQuery && sQuery.length > 0) {
                    var aFilters = new Filter([
                        new Filter("CostCenter", FilterOperator.Contains, sQuery),
                        new Filter("CostCenterName", FilterOperator.Contains, sQuery)
                    ])
                }
                var oBinding = oEvt.getParameter("itemsBinding");
                oBinding.filter(aFilters);
            },

            /**
             * Triggered when user selects one of the SetName from the Valuehelp.
             * @param {*} oEvent 
             */
            onValueHelpCCConfirm: function (oEvent) {
                var value = oEvent.getParameters().selectedItem.getBindingContext().getObject().CostCenter;
                // var uom = oEvent.getParameters().selectedItem.getBindingContext().getObject().MaterialBaseUnit;
                oView.getModel("PostModel").getData().CostCenter = value;
                // oView.getModel("PostModel").getData().Uom = uom;
                oView.getModel("PostModel").refresh();
            },

            onValueHelpClose: function (oEvt) {

            },

            /**
             * On Save Press
             */
            handleSavePress: function (oEvent) {
                var postData = oView.getModel("PostModel").getData();
                
                if(postData.Plant === "" || postData.ProductionOrder === "" || postData.WorkCenter === "" || postData.Material === "" || postData.Quantity === "" || postData.DefectCode === ""
                   || postData.Operator === ""){
                    MessageBox.error(i18n.getText("MandatoryFields"));
                    return;
                }
                delete postData.ProductionOrderText;
                delete postData.WorkCenterText;
                delete postData.MaterialName;
                delete postData.PlantName;
                delete postData.OperatorName;
                var sPath = "/MaterialScrapSet";
                var that = this;
                var oSuccess = function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.success(i18n.getText("DataPosted"));
                    oView.getModel("PostModel").setData({ Plant: Plant });
                    oView.getModel("PostModel").refresh();
                }.bind(this);
                var oError = function (error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(JSON.parse(error.responseText).error.message.value);
                }.bind(this);
                sap.ui.core.BusyIndicator.show();
                this.getOwnerComponent().getModel().create(sPath, postData, {
                    success: oSuccess,
                    error: oError
                });
            },

            handleCancelPress: function (oEvent) {
                oView.getModel("PostModel").setData({ Plant: Plant });
                oView.getModel("PostModel").refresh();
            },
            /**
             * Triggered when user changes Operator Input value.
             * @param {*} oEvent : Change event of Operator Input
             */
            onOperatorChange: function (oEvt) {
                var operator = oEvt.getSource().getValue();
                var sFilters = [];
                sFilters.push(new sap.ui.model.Filter("pernr", sap.ui.model.FilterOperator.EQ, operator));
                var sPath = "/ZP_V_PP_EMPDATA"
                var oSuccess = function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oData.results.length !== 0) {
                        let value = oData.results[0].WorkCenter;
                        let valueText = oData.results[0].WorkCenterText;
                        oView.getModel("PostModel").setProperty("/Operator", value)
                        oView.getModel("PostModel").setProperty("/OperatorName", valueText);

                    }
                    else {
                        this.getView().byId("_IDGenTextOperator").setValue();
                        oView.getModel("PostModel").setProperty("/OperatorName", "");
                        MessageBox.error(i18n.getText("OperatorNotValid"));
                    }
                    oView.getModel("PostModel").refresh();
                }.bind(this);
                var oError = function (error) {
                    sap.ui.core.BusyIndicator.hide();
                }.bind(this);
                sap.ui.core.BusyIndicator.show();
                this.getOwnerComponent().getModel().read(sPath, {
                    success: oSuccess,
                    error: oError,
                    filters: sFilters

                });
            },            
            onProductionChange: function (oEvt) {
                var production = oEvt.getSource().getValue();
                if(production === "" || production === undefined){
                    oView.getModel("PostModel").setProperty("/WorkCenter", "");
                    oView.getModel("PostModel").setProperty("/WorkCenterText", "");  
                    return;
                }
                // var sPath = "/I_ManufacturingOrder(ManufacturingOrder='" + production + "')";
                var sFilters = [];
                sFilters.push(new sap.ui.model.Filter("ManufacturingOrder", sap.ui.model.FilterOperator.EQ, production));
                var sPath = "/I_ManufacturingOrder"
                var oSuccess = function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oData.results.length !== 0) {
                    }
                    else {
                        this.getView().byId("_IDGenInputPRDORD").setValue();
                        MessageBox.error(i18n.getText("InvalidProductionOrder"));
                    }

                }.bind(this);
                var oError = function (error) {
                    sap.ui.core.BusyIndicator.hide();
                }.bind(this);
                sap.ui.core.BusyIndicator.show();
                this.getOwnerComponent().getModel().read(sPath, {
                    success: oSuccess,
                    error: oError,
                    filters: sFilters

                });

                this.onProdConfirm();
            },
            onWorkCenterChange: function (oEvent) {
                  // Add Production Order filter
                  if (oView.getModel("PostModel").getProperty("/ProductionOrder")) {
                    var oFilter = new sap.ui.model.Filter(
                        "ManufacturingOrder",
                        sap.ui.model.FilterOperator.EQ,
                        oView.getModel("PostModel").getProperty("/ProductionOrder")
                    );
                }else{
                    oEvent.getSource().setValue();
                    MessageToast.show(i18n.getText("PleaseEnterProdOrderFirst"));
                    return;
                }
                if(workCenter === "" || workCenter === undefined){
                    oView.getModel("PostModel").getData().WorkCenterText = "";
                    oView.getModel("PostModel").refresh();  
                    return; 
                }
                var workCenter = oEvent.getSource().getValue();
                var sFilters = [];
                sFilters.push(new sap.ui.model.Filter("WorkCenter", sap.ui.model.FilterOperator.EQ, workCenter.toLocaleUpperCase()));
                sFilters.push(oFilter);
                var sPath = "/ZP_V_PP_PO_WRKCNTR";
                var oSuccess = function (oData) {
                    debugger;
                    sap.ui.core.BusyIndicator.hide();
                    if (oData.results.length !== 0) {
                        var value = oData.results[0].WorkCenter;
                        var valueText = oData.results[0].WorkCenterText;
                        oView.getModel("PostModel").getData().WorkCenter = value;
                        oView.getModel("PostModel").getData().WorkCenterText = valueText;
                        oView.getModel("PostModel").refresh();
                    }
                    else {
                        this.getView().byId("_IDGenInputWorkCenter").setValue();
                        oView.getModel("PostModel").getData().WorkCenterText = "";
                        oView.getModel("PostModel").refresh();
                        MessageBox.error(i18n.getText("InvalidWorkCenter"));
                    }

                }.bind(this);
                var oError = function (error) {
                    sap.ui.core.BusyIndicator.hide();
                }.bind(this);
                sap.ui.core.BusyIndicator.show();
                this.getOwnerComponent().getModel().read(sPath, {
                    success: oSuccess,
                    error: oError,
                    filters: sFilters

                });
            },
            onMaterialChange: function (oEvent) {
                var material = oEvent.getSource().getValue();
                var sFilters = [];
                sFilters.push(new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, material));

                var sPath = "/C_MM_MaterialValueHelp";
                var oSuccess = function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oData.results.length !== 0) {
                        var value = oData.results[0].Material;
                        var uom = oData.results[0].MaterialBaseUnit;
                        var matDesc = oData.results[0].MaterialName;
                        oView.getModel("PostModel").getData().Material = value;
                        oView.getModel("PostModel").getData().MaterialName = matDesc;
                        oView.getModel("PostModel").getData().UoM = uom;
                        oView.getModel("PostModel").refresh();
                    }
                    else {
                        this.getView().byId("name").setValue();
                        MessageBox.error(i18n.getText("InvalidProduct"));
                    }

                }.bind(this);
                var oError = function (error) {
                    sap.ui.core.BusyIndicator.hide();
                }.bind(this);
                sap.ui.core.BusyIndicator.show();
                this.getOwnerComponent().getModel().read(sPath, {
                    success: oSuccess,
                    error: oError,
                    filters: sFilters

                });
            }
        });
    });
