import sys
from awsglue.utils import getResolvedOptions


def main():
    # Get job parameters
    args = getResolvedOptions(sys.argv, ["JOB_NAME"])

    print(f"Starting job: {args['JOB_NAME']}")

    # Add your processing logic here
    print("Processing completed successfully")


if __name__ == "__main__":
    main()
