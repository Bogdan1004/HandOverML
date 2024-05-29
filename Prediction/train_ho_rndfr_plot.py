import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix
import pickle


# Load the CSV data into a DataFrame
data = pd.read_csv("handover_data.csv")

# Define features and target variable

numerical_features = ["Cell_Load", "RSRP", "RSRQ"]

target = "Handover_Decision"  



# Visualize data using pair plots (for numerical features) CAN BE COMMENTED OUT for faster execution
#sns.pairplot(data[numerical_features + [target]], hue=target, diag_kind="kde")
#plt.show()

# Split the data into training and testing sets
X = data[numerical_features]
y = data[target]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
scores=[ ]
n_estimators=range(1,51)  #example
for i in n_estimators :
    model=RandomForestClassifier(n_estimators=i)
    model.fit(X_train,y_train)
    scores.append(model.score(X_test,y_test))
    print('score:{}, n_estimator:{}'.format(scores[i-1],i))

plt.plot(n_estimators,scores)
plt.xlabel('n_estimators')
plt.ylabel('testing accuracy')
# Initialize and train a Random Forest Classifier
clf = RandomForestClassifier()
clf.fit(X_train, y_train)


# Perform k-fold cross-validation
k = 5
scores = cross_val_score(clf, X, y, cv=k, scoring='accuracy')
print(f"Average Accuracy (k-fold CV): {scores.mean() * 100:.2f}%")

# Make predictions
y_pred = clf.predict(X_test)

# Create a DataFrame with actual and predicted values
results_df = pd.DataFrame({"Actual": y_test, "Predicted": y_pred})

# Display the side-by-side comparison
print("\nActual vs. Predicted:")
print(results_df)

# Evaluate the model
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")


# Calculate precision
#precision = precision_score(y_test, y_pred)

# Calculate recall
#recall = recall_score(y_test, y_pred)

# Calculate F1-score
#f1 = f1_score(y_test, y_pred)

# Calculate confusion matrix
conf_matrix = confusion_matrix(y_test, y_pred)

#print(f"Precision: {precision:.2f}")
#print(f"Recall: {recall:.2f}")
#print(f"F1-score: {f1:.2f}")
print("Confusion Matrix:")
print(conf_matrix)

with open('trained_model.pkl', 'wb') as file:
    pickle.dump(clf, file)