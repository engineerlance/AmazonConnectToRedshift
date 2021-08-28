# Amazon Connect to Redshift

_This project is a demo of how a kinesis stream from Amazon Connect(an omnichannel cloud contact center) can be modelled, normalized and copied to a data warehouse in the AWS Cloud, in this case Amazon Redshift using AWS Lambda and trigger events._

## Table of Contents

- [Amazon Connect to Redshift](#amazon-connect-to-redshift)
  - [Table of Contents](#table-of-contents)
  - [Pre-requisites](#pre-requisites)
  - [Usage](#usage)
  - [Data Model](#data-model)
  - [Lambda Functions](#lambda-functions)

## Pre-requisites

- In order to be able to deploy this project, make sure to have the AWS CLI configured with a given profile to use.
- The code assumes that the source S3 buckets **already exists**, if that's not the case please make sure to persist the kinesis stream events coming from Amazon Connect to an S3 bucket.
- In case you haven't yet created the staging bucket that contains the files to be copied to Redshift, please either create one or set the **existing** flag in the S3 event within **serverless.yml** under the **loadCTR** function to false.
- Make sure the bucket contains a **configs** directory with the necessary files inside(can be found under **src/configs**), to be used by the copy command to retrieve the relevant entities from the JSON file
- A Redshift cluster to copy the modelled data into
- An IAM role allowing redshift access to the staging S3 bucket
- A security group to attach to the lambda function that has access to the Redshift cluster

## Usage

To deploy this project, run the following commands in the terminal:

```bash
npm i
sls deploy
```

To package and compile this project with **esbuild**:

```bash
sls package
```

To create the Redshift tables, run the **InitializeTables** method of **dbHelper** found in **src/helpers/dbHelper.js**

## Data Model

Below are the entities modelled as part of this project:

- A **CTRRecord** is an object, mapping to the **facts table** of the data warehouse containing all information relating to a call/chat
- An **Agent** is an object mapping to the agent **dimension table** in the data warehouse containing information about the agent that handled the call
- A **Customer** is an object mapping to the Customer **dimension table** in the data warehouse containing information about the customer
- A **Queue** is a object mapping to the Queue **dimension table** in the data warehouse containing information about a potential queue the customer was put in

## Lambda Functions

This serverless application is made up of two lamba functions, both having S3 trigger events:

- **prepCTR**:

  - This lambda function is configured with a listener on an S3 bucket that contains the CTR files(Contact trace record, [Amazon Connect CTR](https://docs.aws.amazon.com/connect/latest/adminguide/ctr-data-model.html)). Once the Amazon kinesis stream pushes the CTR raw files to that bucket, the prepCTR lambda function will do the following:
    - Parse the incoming raw CTR file, that can be one or a collection of records on interactions of customers with Amazon Connect
    - Seperate the elements of the incoming file into entities, conform with a data warehouse **Star Schema**:
    - Export the resulting objects in JSON format into a staging S3 bucket ready to be copied into Redshift

- **loadCTR**:
  - This lambda function is configured with a listener on an S3 bucket that contains the treated and cleaned up entities.
  - Once a data model conform object is pushed to that bucket, the lambda function will use the JSONPath syntax contained in the configs to run a copy command and move the incoming data to the redshift cluster
