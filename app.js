var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };
    
    Expense.prototype.calcPercentage = function(totalIncome)
    {
        if(totalIncome > 0)
        {
            this.percentage = Math.round(this.value / totalIncome * 100);
        }
        else
        {
            this.percentage = -1;
        }
    }
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    var Income = function(id, description, value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal= function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        })
        data.totals[type] = sum;
    }
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // Se instancia un nuevo ID en base al ultimo
            if(data.allItems[type].length > 0)
            {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else
            {
                ID = 0;
            }
            // Se genera un nuevo item basado en el valor de tipo
            if(type === 'exp')
            {
                newItem = new Expense(ID, des, val);
            }
            else
            {
                newItem = new Expense(ID, des, val);
            }
            
            // Se agrega el item a la estructura data
            data.allItems[type].push(newItem);
            
            // Devuelve el item creado
            return newItem;
        },
        
        calculateBudget: function() {
            
            // Calculo del total de ingresos y gastos
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculo del presupuesto
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculo del porcentaje de ingresos gastados
            if(data.totals.inc > 0)
            {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else
            {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            })
        },
        
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPercentages;
        },
        
        deleteItem: function(type, id){
            var index, ids;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            })
            
            index = ids.indexOf(id)
            
            if (index !== -1)
            {
                data.allItems[type].splice(index, 1);
            }
        },
        
        getBudget: function(){
            return{
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function() {
            console.log(data);
        },
    }
})();

var UIController = (function(){
    
    var DOMstrings = {
        dateLabel:'.budget__title--month',
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        expensesPercLabel: '.item__percentage',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };
    
    var formatNumber = function(num) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num= num.toFixed(2);

        numSplit= num.split('.');

        int = numSplit[0]
        dec = numSplit[1]

        for(var i = 3; i < int.length; i+=4)
        {
            int = int.substr(0, int.length - i) + ',' + int.substr(1,i);
        }

        return int + '.' + dec
    };
    
    var nodeListForEach = function(list, callback){
        for(var i=0; i< list.length; i++)
        {
            callback(list[i],i);
        }
    };
    
    return {
        getInput: function() {
            
            return{
                type: document.querySelector(DOMstrings.inputType).value, // inc  o exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
            
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            
            // Crear HTML con placeholder
            if(type === 'inc')
            {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else
            {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            // Reemplazar el placeholder con datos
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)            
            newHtml = newHtml.replace('%value%', formatNumber(obj.value))


            // Insertar el HTML en el DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID){
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element)
        },
        
        clearFields: function(){
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)  
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            })
            
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj){
            
            var sign = obj.budget > 0 ? '+' : obj.budget === 0 ? '' : '-';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = sign + ' ' + obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = '+ ' + obj.totalIncome;
            document.querySelector(DOMstrings.expensesLabel).textContent = '- ' + obj.totalExpenses;
            
            if (obj.percentage > 0)
            {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else
            {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index){
                
                if(percentages[index]>0)
                {
                    current.textContent = percentages[index] + '%';
                }
                else
                {
                    current.textContent = '---';
                }
                
            })
        },
        
        displayMonth: function() {
            var now, year, month, months;
            
            now = new Date();
            
            const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
              "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];
            
            month = monthNames[now.getMonth()];
            year = now.getFullYear();
            
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' de ' + year;
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            })
            
            document.querySelector(DOMstrings.inputButton).classList.toggle('red')
        },
        
        getDOMStrings: function() {
            return DOMstrings;
        }
    }
    
})();

var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEvenListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event)
        {
            if(event.keyCode === 13 || event.which === 13)
            {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);       
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    }
    
    var ctrlAddItem = function()
    {
        var input, newItem;
        // 1. Obtener los datos de entrada
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0)
        {
            // 2. Aniadir el item al controlador
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Aniadir el item a ui
            UICtrl.addListItem(newItem, input.type);

            // 4. Limpiar campos
            UICtrl.clearFields();

            // 5. Calcular el y actualizar presupuesto
            updateBudget();
            
            // 6. Actualizar porcentajes
            updatePercentages();
        }
        else
        {
            
        }
    }
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID)
        {
            splitID = itemID.split('-');
            
            type = splitID[0].substring(0,3);
            
            ID = parseFloat(splitID[1]);
            
            // 1. Eliminar item de la estructura data
            budgetCtrl.deleteItem(type,ID);

            // 2. Eliminar item del UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Actualizar y mostrar el nuevo presupuesto
            updateBudget();
            
            // 4. Actualizar porcentajes
            updatePercentages();
        }
    }
    
    var updateBudget = function(){
        var budget;
        
        // 1. Calcular presupuesto
        budgetCtrl.calculateBudget();
        
        // 2. devolver presupuesto
        budget = budgetCtrl.getBudget();
        
        // 3. mostrat presupuesto en la UI
        UICtrl.displayBudget(budget);
        
    }
    
    var updatePercentages = function(){
        var percentages;
        
        // 1. Calcular porcentajes
        budgetCtrl.calculatePercentages();
        
        // 2. Leer los porcentajes del controlador de presupuesto
        percentages = budgetCtrl.getPercentages();
        
        // 3. Actualizar los porcentajes en el UI
        UICtrl.displayPercentages(percentages);
    }
    
    return {
        init: function() {
            console.log('Aplication started');
            setupEvenListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            UICtrl.displayMonth();
        }
    }
    
})(budgetController, UIController);

controller.init();