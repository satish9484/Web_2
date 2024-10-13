import pickle
import joblib
import os
import csv
import numpy as np
import logging
import tempfile
from app import fast_mail
from app.models import UserActivity , URLFlag , User
from .feature_extraction import FeatureExtractionTraining
from sklearn.ensemble import BaggingClassifier , StackingClassifier
from fastapi_mail import FastMail, MessageSchema
from io import StringIO

def load_model(model_name):
    try:
        model_path = os.path.join("app", "ModelArtifacts", f"{model_name}_model.joblib") 
        logging.info(model_path)
        model_obj = joblib.load(model_path)
        return model_obj
    except FileNotFoundError:
        print(f"Error: The model file {model_name}.pkl was not found at {model_path}.")
    except pickle.UnpicklingError:
        print(f"Error: There was an issue loading the model from {model_path}.")
    except Exception as e:
        print(f"An unexpected error occurred while loading the model: {str(e)}")

def prediction(url, model_name, user_id):
    try:
        # Feature extraction from the given URL
        obj = FeatureExtractionTraining(url)
        x = np.array(obj.getFeaturesList()).reshape(1, 30)  # Ensure x has the correct shape
        model_obj = load_model(model_name)  # Updated to use model_name

        if model_obj is None:
            return {'success': False, 'Error': 'Model could not be loaded.'}

        # Perform prediction
        y_pred = model_obj.predict(x)[0]
        y_pro_phishing = model_obj.predict_proba(x)[0, 0]
        y_pro_non_phishing = model_obj.predict_proba(x)[0, 1]

        print('Prediction:', y_pred, 'Probability of Phishing:', y_pro_phishing, 'Probability of Non-Phishing:', y_pro_non_phishing)

        # Initialize a dictionary for feature importances
        mapped_features_dict = {}

        # Check if the model is a BaggingClassifier
        if isinstance(model_obj, BaggingClassifier):
            # Ensure the model has estimators
            if hasattr(model_obj, 'estimators_'):
                # Collect feature importances from each base estimator
                feature_importances = []
                for estimator in model_obj.estimators_:
                    if hasattr(estimator, 'feature_importances_'):
                        feature_importances.append(estimator.feature_importances_)
                
                if feature_importances:
                    # Average the feature importances across all estimators
                    feature_importances_mean = np.mean(feature_importances, axis=0).tolist()
                    featurelist = obj.get_method_list()
                    mapped_features_dict = dict(zip(featurelist, feature_importances_mean))
                else:
                    mapped_features_dict = {"error": "None of the base estimators have feature importance.", "success": False}
            else:
                mapped_features_dict = {"error": "The BaggingClassifier has no estimators.", "success": False}
        # Check if the model is a StackingClassifier
        elif isinstance(model_obj, StackingClassifier):
            meta_model = model_obj.final_estimator_
            
            # Check if the meta-model has feature importances
            if hasattr(meta_model, 'feature_importances_'):
                featurelist = obj.get_method_list()
                feature_importances = meta_model.feature_importances_.tolist()
                mapped_features_dict = dict(zip(featurelist, feature_importances))
            else:
                mapped_features_dict = {"error": "The meta-model doesn't have feature importance!!!", "success": False}
        else:
            # Check if the model itself has feature importances
            if hasattr(model_obj, 'feature_importances_'):
                featurelist = obj.get_method_list()
                feature_importances = model_obj.feature_importances_.tolist()
                mapped_features_dict = dict(zip(featurelist, feature_importances))
            else:
                mapped_features_dict = {"error": f"This model {model_name} doesn't have feature importance!!!", "success": False}

        print("mapped_features_dict : ",mapped_features_dict)
        # Save user activity along with feature importance
        save_user_activity(y_pred, y_pro_phishing, y_pro_non_phishing, url, user_id, model_name, mapped_features_dict)

        return "Safe" if y_pred == 1 else "Not Safe"

    except AttributeError as e:
        print(f"Error: {e}. This might be due to a missing or incompatible model.")
    except ValueError as e:
        print(f"Error: {e}. This might be due to incorrect input shape or data type.")
    except Exception as e:
        print(f"An unexpected error occurred during prediction: {str(e)}")




def save_user_activity(y_pred, y_pro_phishing, y_pro_non_phishing, url, user_id, model, feature_importances=None):
    """
    Saves user activity details including the prediction results, probabilities, and feature importances as JSON.

    :param y_pred: The predicted label (e.g., 0 for phishing, 1 for non-phishing).
    :param y_pro_phishing: Probability that the URL is phishing.
    :param y_pro_non_phishing: Probability that the URL is non-phishing.
    :param url: The URL being classified.
    :param user_id: The ID of the user who made the classification.
    :param model: The name of the model used for prediction.
    :param feature_importances: Feature importance values from the model.
    """
    try:
        # Prepare the details data as JSON
        details_data = {
            "predicted_label": str(y_pred),
            "probabilities": {
                "phishing": str(y_pro_phishing * 100),
                "non_phishing": str(y_pro_non_phishing * 100)
            }
        }

        # Include feature importances if available
        if feature_importances is not None:
            details_data["feature_importances"] = feature_importances

        # Determine result message based on probabilities
        result_message = 'Not Safe'
        if y_pred == 1:
            result_message = 'Safe'

        # Create a new UserActivity record
        new_activity = UserActivity(
            user_id=user_id,
            url=url,
            result=result_message,
            model=model,
            details=details_data
        )

        # Save the new activity to the database
        new_activity.save()  # Save method from your MongoDB model

        print(f"Activity saved for user {user_id} with URL: {url}")
    except Exception as e:
        print(f"Error saving user activity: {str(e)}")


def check_url_flag(url: str):
    """Check the URLFlag collection for the URL's status."""
    url_flag = URLFlag.find_by_url(url)
    
    if url_flag:
        if url_flag['flagged']:  # If flagged is True, it's unsafe
            return "Not Safe"
        else:
            return "Safe"
    
    # If URL is not in the collection, return None to proceed with prediction
    return None


async def process_and_send_csv(file_contents: str, user_id: str):
    # Process the CSV content and perform URL predictions
    csv_reader = csv.DictReader(StringIO(file_contents))
    results = []

    for row in csv_reader:
        url = row.get('url')
        print("url:",url)
        if not url:
            continue
               
        result, feature_importances = prediction_csv(url, model="bagging")

        # Flatten the feature importances dictionary into CSV columns
        feature_columns = {f"feature_{k}": v for k, v in feature_importances.items()}
        
        # Prepare the row data
        row_data = {"url": url, "status": result}
        row_data.update(feature_columns)  # Add the feature importances to the row

        results.append(row_data)

    # Collect all the unique feature column names from results to ensure all features are in the CSV
    all_feature_columns = set()
    for result in results:
        all_feature_columns.update([col for col in result.keys() if col.startswith('feature_')])

    # Define the columns (fieldnames) for the CSV, including dynamic feature columns
    fieldnames = ["url", "status"] + sorted(all_feature_columns)

    # Write the results to a new CSV file
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(results)
    output.seek(0)  # Rewind to the beginning of the file to read

    # Save CSV file to a temporary file
    temp_file_path = ''
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv", mode='w') as temp_csv_file:
        temp_csv_file.write(output.getvalue())
        temp_csv_file.flush()  # Ensure all data is written to the file
        temp_file_path = temp_csv_file.name  # Get the path of the temp file

    # Send the CSV file to the user's email
    await send_email_with_csv(temp_file_path, user_id)

    # Clean up the temporary file after email is sent
    if os.path.exists(temp_file_path):
        os.remove(temp_file_path)


async def send_email_with_csv(csv_file_path: str, user_id: str):
    # Fetch the user's email using the user_id
    user = User.find_by_id(user_id)

    if not user or not user.email:
        print("User email not found")
        return

    # Prepare the email message
    message = MessageSchema(
        subject="URL Analysis Results",
        recipients=[user.email],
        body="Attached is the CSV file with the results of the URL analysis.",
        subtype="plain",  # Ensure subtype is set
        attachments=[csv_file_path]  # Use the file path for attachment
    )

    # Send the email using FastMail
    try:
        await fast_mail.send_message(message)
        print(f"Email sent successfully to {user.email} with CSV attachment.")
    except Exception as e:
        print(f"Error sending email: {e}")



def prediction_csv(url, model):
    try:
        obj = FeatureExtractionTraining(url)
        x = np.array(obj.getFeaturesList()).reshape(1, 30)
        model_obj = load_model(model)

        if model_obj is None:
            return {'success': False, 'Error': 'Model could not be loaded.'}

        # Perform prediction
        y_pred = model_obj.predict(x)[0]
        if isinstance(model_obj, BaggingClassifier):
            # Ensure the model has estimators
            if hasattr(model_obj, 'estimators_'):
                # Collect feature importances from each base estimator
                feature_importances = []
                for estimator in model_obj.estimators_:
                    if hasattr(estimator, 'feature_importances_'):
                        feature_importances.append(estimator.feature_importances_)
                
                if feature_importances:
                    # Average the feature importances across all estimators
                    feature_importances_mean = np.mean(feature_importances, axis=0).tolist()
                    featurelist = obj.get_method_list()
                    mapped_features_dict = dict(zip(featurelist, feature_importances_mean))
                else:
                    mapped_features_dict = {"error": "None of the base estimators have feature importance.", "success": False}
            else:
                mapped_features_dict = {"error": "The BaggingClassifier has no estimators.", "success": False}
        # Check if the model is a StackingClassifier
        if y_pred == 1:
            return "Safe" , mapped_features_dict
        return "Not Safe" , mapped_features_dict
    except AttributeError as e:
        print(f"Error: {e}. This might be due to a missing or incompatible model.")
    except ValueError as e:
        print(f"Error: {e}. This might be due to incorrect input shape or data type.")
    except Exception as e:
        print(f"An unexpected error occurred during prediction: {str(e)}")