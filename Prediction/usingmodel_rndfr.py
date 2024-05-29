import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix
import pickle

        

#                Load the trained machine learning model from file
model_file = "trained_model.pkl"  
with open(model_file, 'rb') as file:
    loaded_model = pickle.load(file)

#               Preprocess the input data
# Load the CSV data into a DataFrame
data = pd.read_csv("handover_data.csv")

#            Define features and target variable

numerical_features = ["Cell_Load", "RSRP", "RSRQ"]




X = data[numerical_features]
#Use the preprocessed data to make predictions
predictions = loaded_model.predict(X)
print(predictions)
single_data_point = X.iloc[[0]]  # Extract the first row as a DataFrame see documentation
single_prediction = loaded_model.predict(single_data_point)[0]
Y=data['Handover_Decision']
print(f"Predicted first handover decision : {single_prediction}")
# Evaluate the predictions
#accuracy = accuracy_score(Y, predictions)
#precision = precision_score(y, predictions)
#recall = recall_score(y, predictions)
#f1 = f1_score(y, predictions)
#conf_matrix = confusion_matrix(y, predictions)

# Print the evaluation metrics
#print(f"Accuracy: {accuracy:.2f}")
#print(f"Precision: {precision:.2f}")
#print(f"Recall: {recall:.2f}")
#print(f"F1-score: {f1:.2f}")
#print("Confusion Matrix:")
#print(conf_matrix)

# Visualize data using pair plots (for numerical features)
#sns.pairplot(data[numerical_features + [target]], hue=target, diag_kind="kde")
#plt.show()

